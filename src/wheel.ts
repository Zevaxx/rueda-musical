// Musical helpers and constants for the interactive wheel

// Circle of fifths (clockwise) in Spanish note names.
// Starting at the top position (index 0) with DO, then +5 each step.
export const NOTES_5THS_ES = [
	'DO',
	'SOL',
	'RE',
	'LA',
	'MI',
	'SI',
	'FA#',
	'DO#',
	'SOL#',
	'RE#',
	'LA#',
	'FA',
]

// Display names with enharmonic pairs where common in Spanish
export const NOTES_5THS_ES_ENHARM = [
	'Do',
	'Sol',
	'Re',
	'La',
	'Mi',
	'Si',
	'Solb/Fa#',
	'Reb/Do#',
	'Lab/Sol#',
	'Mib/Re#',
	'Sib/La#',
	'Fa',
]

export function degToRad(d: number) {
	return (d * Math.PI) / 180
}

// Roman numerals for degrees I–VII (if needed for future extensions)
export const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
export function getRomanForDegree(deg: number) {
	return ROMANS[((deg - 1) % 7 + 7) % 7]
}

// Chromatic scale in Spanish with sharps (ascending from DO)
export const CHROMATIC_ES = [
	'DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI',
]

const chromaIndex: Record<string, number> = CHROMATIC_ES
	.reduce((acc, n, i) => { acc[n] = i; return acc }, {} as Record<string, number>)

// Major scale degrees in semitones relative to root
const MAJOR_DEGREES = [0, 2, 4, 5, 7, 9, 11]

export function getMajorScale(root: string): string[] {
	const i = chromaIndex[root]
	if (i === undefined) return [root]
	return MAJOR_DEGREES.map((d) => CHROMATIC_ES[(i + d) % 12])
}

// Convert 'DO', 'DO#' to 'Do', 'Do#' for display
export function toTitleEs(note: string): string {
	const baseMap: Record<string, string> = {
		'DO': 'Do', 'RE': 'Re', 'MI': 'Mi', 'FA': 'Fa', 'SOL': 'Sol', 'LA': 'La', 'SI': 'Si',
	}
	const m = note.match(/^(DO|RE|MI|FA|SOL|LA|SI)([#b]?)$/)
	if (!m) return note
	const [, base, acc] = m
	return `${baseMap[base]}${acc}`
}

// Prefer flat spellings for sectors on the "flat side" of the circle (Gb, Db, Ab, Eb, Bb)
export const FLAT_SIDE_INDICES = new Set([6, 7, 8, 9, 10])
const SHARP_TO_FLAT_ES: Record<string, string> = {
	'DO#': 'Reb',
	'RE#': 'Mib',
	'FA#': 'Solb',
	'SOL#': 'Lab',
	'LA#': 'Sib',
}

export function formatNoteForSector(note: string, sectorIndex: number): string {
	const upper = note.toUpperCase()
	const preferFlat = FLAT_SIDE_INDICES.has(sectorIndex)
	const flat = preferFlat && SHARP_TO_FLAT_ES[upper]
	return flat ? flat : toTitleEs(upper)
}

// Relative minor names for each sector (matching the reference image order)
// Index aligned with NOTES_5THS_ES / NOTES_5THS_ES_ENHARM
export const REL_MINOR_ES_ENHARM = [
	'Lam',        // Do mayor
	'Mim',        // Sol mayor
	'Sim',        // Re mayor
	'Fa#m',       // La mayor
	'Do#m',       // Mi mayor
	'Sol#m',      // Si mayor
	'Mibm/Re#m',  // Solb/Fa# mayor
	'Sibm',       // Reb/Do# mayor
	'Fam',        // Lab/Sol# mayor
	'Dom',        // Mib/Re# mayor
	'Solm',       // Sib/La# mayor
	'Rem',        // Fa mayor
]

// --- English display helpers (for chord table like the image) ---
const ES_TO_EN_SHARP: Record<string, string> = {
	'DO': 'C', 'DO#': 'C#', 'RE': 'D', 'RE#': 'D#', 'MI': 'E', 'FA': 'F', 'FA#': 'F#',
	'SOL': 'G', 'SOL#': 'G#', 'LA': 'A', 'LA#': 'A#', 'SI': 'B',
}
const ES_TO_EN_FLAT: Record<string, string> = {
	'DO': 'C', 'RE': 'D', 'MI': 'E', 'FA': 'F', 'SOL': 'G', 'LA': 'A', 'SI': 'B',
	'DO#': 'Db', 'RE#': 'Eb', 'FA#': 'Gb', 'SOL#': 'Ab', 'LA#': 'Bb',
}

export function toEnglishNote(note: string, preferFlat = false): string {
	const up = note.toUpperCase()
	return (preferFlat ? ES_TO_EN_FLAT[up] : ES_TO_EN_SHARP[up]) ?? up
}

// Build the diatonic triads for a major key in English chord notation
// Returns array of length 7 with chord symbols like: ["C", "Dm", "Em", "F", "G", "Am", "B°"]
export function getMajorKeyChordsEnglish(root: string, preferFlat = false): string[] {
	const scale = getMajorScale(root)
	// Qualities for I..VII triads in major
	const qualities: Array<'M'|'m'|'dim'> = ['M','m','m','M','M','m','dim']
	return scale.map((n, i) => {
		const base = toEnglishNote(n, preferFlat)
		const q = qualities[i]
		if (q === 'M') return base
		if (q === 'm') return `${base}m`
		return `${base}°`
	})
}

// Convenience to get Spanish title-cased note (e.g., "Do") for labels
export function toSpanishTitle(note: string): string { return toTitleEs(note) }
