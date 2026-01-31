// https://numeraljs.com/
import numeral from "numeral";

type InputValue = string | number | null | undefined;

export function fNumber(number: InputValue) {
	return numeral(number).format();
}

export function fCurrency(number: InputValue) {
	const format = number ? numeral(number).format("$0,0.00") : "";

	return result(format, ".00");
}

export function fPercent(number: InputValue) {
	const format = number ? numeral(Number(number) / 100).format("0.0%") : "";

	return result(format, ".0");
}

export function fShortenNumber(number: InputValue) {
	const format = number ? numeral(number).format("0.00a") : "";

	return result(format, ".00");
}

export function fBytes(number: InputValue) {
	const format = number ? numeral(number).format("0.0 b") : "";

	return result(format, ".0");
}

function result(format: string, key = ".00") {
	const isInteger = format.includes(key);

	return isInteger ? format.replace(key, "") : format;
}

// Helper function to convert numbers to words
export const numberToWords = (num: number): string => {
	const ones = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
	const teens = [
		"diez",
		"once",
		"doce",
		"trece",
		"catorce",
		"quince",
		"dieciséis",
		"diecisiete",
		"dieciocho",
		"diecinueve",
	];
	const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
	const hundreds = [
		"",
		"ciento",
		"doscientos",
		"trescientos",
		"cuatrocientos",
		"quinientos",
		"seiscientos",
		"setecientos",
		"ochocientos",
		"novecientos",
	];

	if (num === 0) return "cero";
	if (num < 10) return ones[num];
	if (num < 20) return teens[num - 10];
	if (num < 100) {
		const ten = Math.floor(num / 10);
		const one = num % 10;
		return one === 0 ? tens[ten] : `${tens[ten]} y ${ones[one]}`;
	}
	if (num < 1000) {
		const hundred = Math.floor(num / 100);
		const remainder = num % 100;
		return hundreds[hundred] + (remainder > 0 ? ` ${numberToWords(remainder)}` : "");
	}
	if (num < 1000000) {
		const thousand = Math.floor(num / 1000);
		const remainder = num % 1000;
		return `${numberToWords(thousand)} mil${remainder > 0 ? ` ${numberToWords(remainder)}` : ""}`;
	}
	if (num < 1000000000) {
		const million = Math.floor(num / 1000000);
		const remainder = num % 1000000;
		return `${numberToWords(million)} millón${remainder > 0 ? ` ${numberToWords(remainder)}` : ""}`;
	}
	return "número muy grande";
};
