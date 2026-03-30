import { describe, expect, it } from 'vitest';

import { BYTE, displaySize, formatAcceptDisplay, GIGABYTE, KILOBYTE, MEGABYTE } from './utils';

describe('displaySize', () => {
	it('returns bytes for values under 1 KB', () => {
		expect(displaySize(0)).toBe('0 B');
		expect(displaySize(512)).toBe('512 B');
		expect(displaySize(1023)).toBe('1023 B');
	});

	it('returns KB for values under 1 MB', () => {
		expect(displaySize(KILOBYTE)).toBe('1.0 KB');
		expect(displaySize(1.5 * KILOBYTE)).toBe('1.5 KB');
		expect(displaySize(MEGABYTE - 1)).toBe('1024.0 KB');
	});

	it('returns MB for values under 1 GB', () => {
		expect(displaySize(MEGABYTE)).toBe('1.0 MB');
		expect(displaySize(5 * MEGABYTE)).toBe('5.0 MB');
		expect(displaySize(GIGABYTE - 1)).toBe('1024.0 MB');
	});

	it('returns GB for values >= 1 GB', () => {
		expect(displaySize(GIGABYTE)).toBe('1.0 GB');
		expect(displaySize(2.5 * GIGABYTE)).toBe('2.5 GB');
	});

	it('returns dash for negative values', () => {
		expect(displaySize(-1)).toBe('\u2014');
		expect(displaySize(-100)).toBe('\u2014');
	});

	it('returns dash for non-finite values', () => {
		expect(displaySize(Infinity)).toBe('\u2014');
		expect(displaySize(-Infinity)).toBe('\u2014');
		expect(displaySize(NaN)).toBe('\u2014');
	});

	it('handles exact boundary at 1 byte', () => {
		expect(displaySize(BYTE)).toBe('1 B');
	});
});

describe('formatAcceptDisplay', () => {
	it('converts file extensions to uppercase', () => {
		expect(formatAcceptDisplay('.pdf')).toBe('PDF');
		expect(formatAcceptDisplay('.doc,.docx')).toBe('DOC, DOCX');
	});

	it('converts MIME wildcards to human-readable labels', () => {
		expect(formatAcceptDisplay('image/*')).toBe('Images');
		expect(formatAcceptDisplay('video/*')).toBe('Videos');
		expect(formatAcceptDisplay('audio/*')).toBe('Audio');
		expect(formatAcceptDisplay('text/*')).toBe('Text');
	});

	it('handles mixed extensions and MIME types', () => {
		expect(formatAcceptDisplay('image/*,.pdf,.doc')).toBe('Images, PDF, DOC');
	});

	it('passes through unknown MIME types verbatim', () => {
		expect(formatAcceptDisplay('application/json')).toBe('application/json');
	});

	it('handles whitespace in accept string', () => {
		expect(formatAcceptDisplay('.pdf, .doc, .txt')).toBe('PDF, DOC, TXT');
	});
});
