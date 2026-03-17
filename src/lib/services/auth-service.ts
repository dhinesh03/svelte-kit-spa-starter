/**
 * AuthService.ts - Azure AD Authentication Service
 *
 * Universal singleton that works in both Svelte 5 components (reactive)
 * and plain JS/TS files. Uses `createSubscriber` for optional reactivity.
 */

import { createSubscriber } from 'svelte/reactivity';

import {
	AuthError,
	BrowserAuthError,
	EventType,
	InteractionRequiredAuthError,
	NavigationClient,
	PublicClientApplication,
	type AccountInfo,
	type AuthenticationResult,
	type Configuration,
	type EndSessionRequest,
	type EventMessage,
	type RedirectRequest,
	type SilentRequest
} from '@azure/msal-browser';

import { CustomNavigationClient } from './navigation-client';

export interface AuthServiceConfig {
	tenantId: string;
	clientId: string;
	scopes: readonly string[];
	redirectUri?: string;
	postLogoutRedirectUri?: string;
	cacheLocation?: 'localStorage' | 'sessionStorage' | 'memoryStorage';
	storeAuthStateInCookie?: boolean;
	navigateToLoginRequestUrl?: boolean;
	enableLogging?: boolean;
	enableSsoSilent?: boolean;
}

export interface UserProfile {
	id: string;
	username: string;
	name: string | null;
	email: string;
	roles: string[];
	claims: Record<string, unknown>;
}

export interface AuthState {
	isInitialized: boolean;
	isAuthenticated: boolean;
	account: AccountInfo | null;
	userProfile: UserProfile | null;
	isLoading: boolean;
	error: string | null;
}
export class AuthServiceError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'AuthServiceError';
	}
}

const isBrowser = typeof window !== 'undefined';

/**
 * Get the current origin, safe for SSR
 */
function getOrigin(): string {
	return isBrowser ? window.location.origin : '';
}

class AuthService {
	private static instance: AuthService | null = null;
	private msalInstance: PublicClientApplication;
	private config: AuthServiceConfig;
	private eventCallbackId: string | null = null;
	private initPromise: Promise<AccountInfo | null> | null = null;

	#state: AuthState = {
		isInitialized: false,
		isAuthenticated: false,
		account: null,
		userProfile: null,
		isLoading: false,
		error: null
	};

	#subscribe: () => void;
	#update: (() => void) | undefined;

	constructor(config: AuthServiceConfig, navigationClient?: NavigationClient) {
		this.validateConfig(config);
		this.config = { enableSsoSilent: false, storeAuthStateInCookie: false, navigateToLoginRequestUrl: false, ...config };

		this.msalInstance = new PublicClientApplication(this.buildMsalConfig(this.config));

		if (navigationClient) {
			this.msalInstance.setNavigationClient(navigationClient);
		}

		this.#subscribe = createSubscriber((update) => {
			this.#update = update;
			return () => {
				this.#update = undefined;
			};
		});

		this.setupEventCallbacks();
	}

	static getInstance(config?: AuthServiceConfig, navigationClient?: NavigationClient): AuthService {
		if (!AuthService.instance) {
			if (!config) {
				throw new AuthServiceError(
					'AuthServiceConfig is required for first initialization. Call getInstance(config) or initAuthService(config) first.',
					'CONFIG_REQUIRED'
				);
			}
			AuthService.instance = new AuthService(config, navigationClient ?? (isBrowser ? new CustomNavigationClient() : undefined));
		}
		return AuthService.instance;
	}

	static resetInstance(): void {
		if (AuthService.instance) {
			AuthService.instance.destroy();
			AuthService.instance = null;
		}
	}

	/**
	 * Get the current auth state (reactive in Svelte 5 components)
	 */
	get current(): Readonly<AuthState> {
		this.#subscribe();
		return this.#state;
	}

	private set current(newState: Partial<AuthState>) {
		this.#state = { ...this.#state, ...newState };
		this.#update?.();
	}

	private log(level: 'warn' | 'error', ...args: unknown[]): void {
		if (this.config.enableLogging) {
			console[level]('[AuthService]', ...args);
		}
	}

	private validateConfig(config: AuthServiceConfig): void {
		if (!config.tenantId) {
			throw new AuthServiceError('tenantId is required', 'CONFIG_MISSING_TENANT_ID');
		}
		if (!config.clientId) {
			throw new AuthServiceError('clientId is required', 'CONFIG_MISSING_CLIENT_ID');
		}
		if (!config.scopes?.length) {
			throw new AuthServiceError('scopes array is required and must not be empty', 'CONFIG_MISSING_SCOPES');
		}
	}

	private buildMsalConfig(config: AuthServiceConfig): Configuration {
		const origin = getOrigin();
		return {
			auth: {
				clientId: config.clientId,
				authority: `https://login.microsoftonline.com/${config.tenantId}`,
				redirectUri: config.redirectUri || origin,
				postLogoutRedirectUri: config.postLogoutRedirectUri || origin,
				navigateToLoginRequestUrl: config.navigateToLoginRequestUrl ?? false
			},
			cache: {
				cacheLocation: config.cacheLocation || 'sessionStorage',
				storeAuthStateInCookie: config.storeAuthStateInCookie ?? false
			},
			system: {
				allowRedirectInIframe: false,
				loggerOptions: config.enableLogging
					? {
							loggerCallback: (_level, message, containsPii) => {
								if (!containsPii) console.log(`[MSAL] ${message}`);
							},
							piiLoggingEnabled: false
						}
					: undefined
			}
		};
	}

	private setupEventCallbacks(): void {
		this.eventCallbackId = this.msalInstance.addEventCallback((event: EventMessage) => {
			switch (event.eventType) {
				case EventType.LOGIN_SUCCESS:
				case EventType.ACQUIRE_TOKEN_SUCCESS: {
					const account = (event.payload as AuthenticationResult)?.account;
					if (account) {
						this.handleAuthSuccess(account);
					}
					break;
				}

				case EventType.LOGOUT_SUCCESS:
					this.current = { account: null, userProfile: null, isAuthenticated: false };
					break;

				case EventType.LOGIN_FAILURE:
				case EventType.ACQUIRE_TOKEN_FAILURE:
					if (event.error) {
						this.handleError(event.error);
					}
					break;
			}
		});
	}

	private clearStaleInteractionState(): void {
		if (!isBrowser) return;

		try {
			// Only remove the interaction status key, not the entire MSAL cache.
			// MSAL stores the interaction lock under "msal.interaction.status" in sessionStorage.
			// Removing all "msal.*" keys would destroy cached tokens and accounts.
			const interactionKey = 'msal.interaction.status';
			sessionStorage.removeItem(interactionKey);
		} catch {
			// Ignore storage errors
		}

		this.log('warn', 'Cleared stale interaction state');
	}

	private extractUserProfile(account: AccountInfo): UserProfile {
		const claims = (account.idTokenClaims as Record<string, unknown>) ?? {};

		return {
			id: account.homeAccountId,
			username: account.username,
			name: account.name || null,
			email: (claims.email as string) ?? (claims.preferred_username as string) ?? account.username,
			roles: Array.isArray(claims.roles) ? (claims.roles as string[]) : [],
			claims
		};
	}

	private handleAuthSuccess(account: AccountInfo): void {
		this.msalInstance.setActiveAccount(account);
		this.current = {
			account,
			userProfile: this.extractUserProfile(account),
			isAuthenticated: true,
			error: null
		};
	}

	private handleError(error: unknown): void {
		const message = error instanceof Error ? error.message : 'An unknown error occurred';
		const code = error instanceof AuthError ? error.errorCode : 'UNKNOWN_ERROR';

		this.log('error', { code, message, error });

		const isMonitorTimeout = code === 'monitor_window_timeout';

		this.current = {
			error: isMonitorTimeout ? 'Authentication session expired. Please clear cache and try again.' : message,
			isLoading: false
		};
	}

	/**
	 * Initialize the auth service. Must be called before using other methods.
	 *
	 * @returns The authenticated account, or null if not authenticated
	 * @throws AuthServiceError if initialization fails
	 */
	async initialize(): Promise<AccountInfo | null> {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = this._initializeInternal();
		return this.initPromise;
	}

	private async _initializeInternal(): Promise<AccountInfo | null> {
		try {
			this.current = { isLoading: true, error: null };
			await this.msalInstance.initialize();
			let response: AuthenticationResult | null = null;

			try {
				response = await this.msalInstance.handleRedirectPromise();
			} catch (error) {
				// Handle interaction_in_progress during redirect handling
				if (error instanceof BrowserAuthError && error.errorCode === 'interaction_in_progress') {
					this.log('warn', 'Stale interaction detected during redirect handling');
					this.clearStaleInteractionState();
					// Try again after clearing
					response = await this.msalInstance.handleRedirectPromise();
				} else {
					throw error;
				}
			}

			if (response?.account) {
				this.handleAuthSuccess(response.account);
				return response.account;
			}

			const activeAccount = this.msalInstance.getActiveAccount();
			if (activeAccount) {
				this.handleAuthSuccess(activeAccount);
				return activeAccount;
			}

			const accounts = this.msalInstance.getAllAccounts();
			const tenantAccount = accounts.find((a) => a.tenantId === this.config.tenantId);
			if (tenantAccount) {
				this.handleAuthSuccess(tenantAccount);
				return tenantAccount;
			}

			if (this.config.enableSsoSilent && accounts.length === 0) {
				try {
					await this.ssoSilent();
					return this.#state.account;
				} catch {
					// Silent SSO failed, user must sign in manually
				}
			}

			return null;
		} catch (error) {
			// Clear initPromise on failure to allow retries on subsequent calls
			this.initPromise = null;
			this.handleError(error);
			throw error instanceof AuthServiceError
				? error
				: new AuthServiceError(error instanceof Error ? error.message : 'Initialization failed', 'INIT_FAILED', error);
		} finally {
			this.current = { isLoading: false, isInitialized: true };
		}
	}

	async login(loginHint?: string, extraScopes: string[] = []): Promise<void> {
		this.ensureInitialized();

		const loginRequest: RedirectRequest = {
			scopes: [...this.config.scopes, ...extraScopes],
			loginHint
		};

		try {
			this.current = { isLoading: true, error: null };
			await this.withStaleInteractionRecovery(() => this.msalInstance.loginRedirect(loginRequest));
		} catch (error) {
			this.current = { isLoading: false };
			this.handleError(error);
			throw new AuthServiceError(error instanceof Error ? error.message : 'Login failed', 'LOGIN_FAILED', error);
		}
	}

	async logout(): Promise<void> {
		this.ensureInitialized();
		const logoutRequest: EndSessionRequest = {
			account: this.#state.account || undefined,
			postLogoutRedirectUri: this.config.postLogoutRedirectUri || getOrigin()
		};

		try {
			this.current = { isLoading: true, error: null };
			await this.withStaleInteractionRecovery(() => this.msalInstance.logoutRedirect(logoutRequest));
		} catch (error) {
			this.current = { isLoading: false };
			this.handleError(error);
			throw new AuthServiceError(error instanceof Error ? error.message : 'Logout failed', 'LOGOUT_FAILED', error);
		}
	}

	/**
	 * Get an access token for API calls
	 *
	 * @param forceRefresh - Force token refresh even if cached token is valid
	 * @param additionalScopes - Additional scopes beyond configured defaults
	 * @returns The access token string
	 * @throws AuthServiceError if token cannot be acquired
	 */
	async getAccessToken(forceRefresh = false, additionalScopes: string[] = []): Promise<string> {
		this.ensureInitialized();
		this.ensureAuthenticated();

		const request: SilentRequest = {
			scopes: [...this.config.scopes, ...additionalScopes],
			account: this.#state.account!,
			forceRefresh
		};

		try {
			const response = await this.msalInstance.acquireTokenSilent(request);
			return response.accessToken;
		} catch (error) {
			if (error instanceof InteractionRequiredAuthError) {
				const redirectRequest: RedirectRequest = {
					scopes: request.scopes,
					account: request.account
				};
				await this.withStaleInteractionRecovery(() => this.msalInstance.acquireTokenRedirect(redirectRequest));
				// Redirect will navigate away; throw to prevent callers from using an empty token
				throw new AuthServiceError('Interactive authentication required. Redirect in progress.', 'REDIRECT_IN_PROGRESS', error);
			}
			this.handleError(error);
			throw new AuthServiceError(error instanceof Error ? error.message : 'Token acquisition failed', 'TOKEN_ACQUISITION_FAILED', error);
		}
	}

	getIdToken(): string | null {
		return this.#state.account?.idToken || null;
	}

	/**
	 * Helper to make authenticated API calls
	 *
	 * @param apiCall - Function that receives the token and makes the API call
	 * @returns The result of the API call
	 *
	 * @example
	 * ```typescript
	 * const data = await auth.withAuth(async (token) => {
	 *   const res = await fetch('/api/data', {
	 *     headers: { Authorization: `Bearer ${token}` }
	 *   });
	 *   return res.json();
	 * });
	 * ```
	 */
	async withAuth<T>(apiCall: (token: string) => Promise<T>): Promise<T> {
		const token = await this.getAccessToken();
		return apiCall(token);
	}

	getAllAccounts(): AccountInfo[] {
		return this.msalInstance.getAllAccounts();
	}

	/**
	 * Switch to a different cached account
	 *
	 * @param account - The account to switch to (must exist in cache)
	 * @throws AuthServiceError if account is invalid or not found
	 */
	switchAccount(account: AccountInfo): void {
		if (!account) {
			throw new AuthServiceError('Account is required', 'INVALID_ACCOUNT');
		}

		const accounts = this.msalInstance.getAllAccounts();
		const exists = accounts.some((a) => a.homeAccountId === account.homeAccountId);

		if (!exists) {
			throw new AuthServiceError('Account not found in cache. User may need to sign in again.', 'ACCOUNT_NOT_FOUND');
		}

		this.handleAuthSuccess(account);
	}

	clearError(): void {
		this.current = { error: null };
	}

	private async clearAccountFromCache(account: AccountInfo): Promise<void> {
		try {
			await this.msalInstance.clearCache({ account });
		} catch (e) {
			this.log('warn', 'Failed to clear account from cache:', e);
		}
	}

	async clearCacheAndReload(): Promise<void> {
		try {
			const accounts = this.msalInstance.getAllAccounts();
			for (const account of accounts) {
				await this.clearAccountFromCache(account);
			}
		} catch (e) {
			this.log('warn', 'Failed to clear cache:', e);
		}

		if (isBrowser) {
			window.location.reload();
		}
	}

	destroy(): void {
		if (this.eventCallbackId) {
			this.msalInstance.removeEventCallback(this.eventCallbackId);
			this.eventCallbackId = null;
		}
		this.initPromise = null;
		this.#state = {
			isInitialized: false,
			isAuthenticated: false,
			account: null,
			userProfile: null,
			isLoading: false,
			error: null
		};
		this.#update?.();
	}

	private isStaleInteractionError(error: unknown): boolean {
		return error instanceof BrowserAuthError && error.errorCode === 'interaction_in_progress';
	}

	private async withStaleInteractionRecovery<T>(fn: () => Promise<T>): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (this.isStaleInteractionError(error)) {
				this.log('warn', 'Stale interaction detected, clearing interaction state and retrying');
				this.clearStaleInteractionState();
				return await fn();
			}
			throw error;
		}
	}

	private async ssoSilent(): Promise<void> {
		const response = await this.withStaleInteractionRecovery(() => this.msalInstance.ssoSilent({ scopes: [...this.config.scopes] }));

		if (response?.account) {
			this.handleAuthSuccess(response.account);
		}
	}

	private ensureInitialized(): void {
		if (!this.#state.isInitialized) {
			throw new AuthServiceError('AuthService not initialized. Call initialize() first.', 'NOT_INITIALIZED');
		}
	}

	private ensureAuthenticated(): void {
		if (!this.#state.account) {
			throw new AuthServiceError('No authenticated user. Please login first.', 'NOT_AUTHENTICATED');
		}
	}
}

export function getAuthService(): AuthService {
	return AuthService.getInstance();
}

export function initAuthService(config?: AuthServiceConfig, navigationClient?: NavigationClient): AuthService {
	return AuthService.getInstance(config, navigationClient);
}

export function resetAuthService(): void {
	AuthService.resetInstance();
}

export default AuthService;
