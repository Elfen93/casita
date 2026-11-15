class_name Fiscal
extends RefCounted
# Bloque TRABAJO Y DINERO · impuestos de una nómina (España 2026, simplificado como en el juego web: mods/fiscal.js -> fsTax).
# Los tramos, la cotización y el mínimo personal salen de data/gobiernos.json -> fiscal.centro (el sistema tal como está).
# Cotización de la trabajadora: `ssw` sobre el bruto con tope de base; la de la empresa: `sse`.
# IRPF: rendimiento neto = bruto - cotización - 2.000 de gastos; reducción por rendimientos del trabajo; escala sobre la base
# menos escala sobre el mínimo personal; exento hasta `smiTo` (el SMI) con una rampa de 1.200 €.

const TOPE_BASE := 61214.0

static var P: Dictionary = {}

static func cargar(gobiernos: Dictionary) -> void:
	P = gobiernos.get("fiscal", {}).get("centro", {})

static func _escala(base: float, tr: Array) -> float:
	var c := 0.0
	var lo := 0.0
	for t in tr:
		var hi := float(t[0])
		if base <= lo:
			break
		c += (minf(base, hi) - lo) * float(t[1])
		lo = hi
	return c

## cotización y cuota de IRPF de un año de trabajo con bruto anual A (euros)
static func impuestos(A: float) -> Dictionary:
	var ss := minf(A, TOPE_BASE) * float(P.get("ssw", 0.065))
	var rn := A - ss - 2000.0
	var red := 7302.0 if rn <= 14852.0 else (7302.0 - 1.75 * (rn - 14852.0) if rn < 19747.0 else 0.0)
	var base := maxf(0.0, rn - red)
	var tr: Array = P.get("tr", [])
	var irpf := maxf(0.0, _escala(base, tr) - _escala(minf(base, float(P.get("min", 5550))), tr))
	var smi := float(P.get("smiTo", 0))
	if smi > 0.0:
		if A <= smi:
			irpf = 0.0
		elif A < smi + 1200.0:
			irpf *= (A - smi) / 1200.0
	return {"ss": ss, "irpf": irpf}

## bruto anual que deja `neto` euros al año (búsqueda por bisección, como fsGrossYr)
static func bruto_de_neto(neto: float) -> float:
	var lo := neto
	var hi := neto * 2.2
	for i in 40:
		var m := (lo + hi) * 0.5
		var t := impuestos(m)
		if m - t["ss"] - t["irpf"] < neto:
			lo = m
		else:
			hi = m
	return hi

## nómina de un mes: `bruto_contrato` es el bruto mensual del contrato (para el tipo de retención, anualizado a 12 pagas);
## `bruto` lo que se cobra este mes (prorrateado y con descuentos)
static func nomina(bruto_contrato: float, bruto: float) -> Dictionary:
	var A := bruto_contrato * 12.0
	var t := impuestos(A)
	var ret: float = t["irpf"] / A if A > 0.0 else 0.0
	var ssr := float(P.get("ssw", 0.065))
	var ss := snappedf(bruto * ssr, 0.01)
	var irpf := snappedf(bruto * ret, 0.01)
	var emp := snappedf(bruto * float(P.get("sse", 0.315)), 0.01)
	return {"bruto": snappedf(bruto, 0.01), "ss": ss, "irpf": irpf, "neto": snappedf(bruto - ss - irpf, 0.01), "ret": ret, "ssr": ssr, "emp": emp, "coste": snappedf(bruto + emp, 0.01)}
