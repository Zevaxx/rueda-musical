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

// Circle of fifths (clockwise) in English note names.
// Starting at the top position (index 0) with C, then +5 each step.
export const NOTES_5THS_EN = [
	'C',
	'G',
	'D',
	'A',
	'E',
	'B',
	'F#',
	'C#',
	'G#',
	'D#',
	'A#',
	'F',
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

// Display names with enharmonic pairs where common in English
export const NOTES_5THS_EN_ENHARM = [
	'C',
	'G',
	'D',
	'A',
	'E',
	'B',
	'Gb/F#',
	'Db/C#',
	'Ab/G#',
	'Eb/D#',
	'Bb/A#',
	'F',
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

// Chromatic scale in English with sharps (ascending from C)
export const CHROMATIC_EN = [
	'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
]

const chromaIndexEs: Record<string, number> = CHROMATIC_ES
	.reduce((acc, n, i) => { acc[n] = i; return acc }, {} as Record<string, number>)

const chromaIndexEn: Record<string, number> = CHROMATIC_EN
	.reduce((acc, n, i) => { acc[n] = i; return acc }, {} as Record<string, number>)

// Major scale degrees in semitones relative to root
const MAJOR_DEGREES = [0, 2, 4, 5, 7, 9, 11]

export function getMajorScale(root: string): string[] {
	// Try Spanish first, then English
	let i = chromaIndexEs[root]
	let chromatic = CHROMATIC_ES
	
	if (i === undefined) {
		i = chromaIndexEn[root]
		chromatic = CHROMATIC_EN
	}
	
	if (i === undefined) return [root]
	return MAJOR_DEGREES.map((d) => chromatic[(i + d) % 12])
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

// Convert 'C', 'C#' to 'C', 'C#' for display (English notes are already in correct case)
export function toTitleEn(note: string): string {
	return note
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

// Relative minor names for each sector in English notation
// Index aligned with NOTES_5THS_EN / NOTES_5THS_EN_ENHARM
export const REL_MINOR_EN_ENHARM = [
	'Am',         // C major
	'Em',         // G major
	'Bm',         // D major
	'F#m',        // A major
	'C#m',        // E major
	'G#m',        // B major
	'Ebm/D#m',    // Gb/F# major
	'Bbm',        // Db/C# major
	'Fm',         // Ab/G# major
	'Cm',         // Eb/D# major
	'Gm',         // Bb/A# major
	'Dm',         // F major
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

// Build the diatonic triads for a major key in Spanish chord notation
// Returns array of length 7 with chord symbols like: ["Do", "Rem", "Mim", "Fa", "Sol", "Lam", "Si°"]
export function getMajorKeyChordsSpanish(root: string): string[] {
	const scale = getMajorScale(root)
	// Qualities for I..VII triads in major
	const qualities: Array<'M'|'m'|'dim'> = ['M','m','m','M','M','m','dim']
	return scale.map((n, i) => {
		const base = toSpanishTitle(n)
		const q = qualities[i]
		if (q === 'M') return base
		if (q === 'm') return `${base}m`
		return `${base}°`
	})
}

// Convenience to get Spanish title-cased note (e.g., "Do") for labels
export function toSpanishTitle(note: string): string { return toTitleEs(note) }

// Convenience to get English title-cased note (e.g., "C") for labels  
export function toEnglishTitle(note: string): string { return toTitleEn(note) }

// Get title in the appropriate notation
export function toTitle(note: string, notation: 'spanish' | 'english'): string {
	return notation === 'spanish' ? toSpanishTitle(note) : toEnglishTitle(note)
}
