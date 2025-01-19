// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toApifoxModel(json) {
    return cast(JSON.parse(json), r("ApifoxModel"));
}

function apifoxModelToJson(value) {
    return JSON.stringify(uncast(value, r("ApifoxModel")), null, 2);
}

function invalidValue(typ, val, key, parent = '') {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ) {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => prettyTypeName(a)).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '', parent = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs, val) {
        for (const typ of typs) {
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases, val) {
        if (cases.includes(val)) return val;
        return invalidValue(cases.map(a => l(a)), val, key, parent);
    }

    function transformArray(typ, val) {
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) return null;
        const d = new Date(val);
        if (isNaN(d.valueOf())) return invalidValue(l("Date"), val, key, parent);
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val, key, parent);
    }
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function l(typ) {
    return { literal: typ };
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "ApifoxModel": o([
        { json: "code", js: "code", typ: u(undefined, u(0, null)) },
        { json: "data", js: "data", typ: u(undefined, r("Data")) },
        { json: "developId", js: "developId", typ: u(undefined, u(0, null, "")) },
        { json: "msg", js: "msg", typ: u(undefined, u(null, "")) },
        { json: "requestId", js: "requestId", typ: u(undefined, u(null, "")) },
    ], "any"),
    "Data": o([
        { json: "currentPage", js: "currentPage", typ: u(undefined, u(0, null)) },
        { json: "data", js: "data", typ: u(undefined, u(a(r("Datum")), null)) },
        { json: "pageSize", js: "pageSize", typ: u(undefined, u(0, null)) },
        { json: "totalPage", js: "totalPage", typ: u(undefined, u(0, null)) },
        { json: "totalRecords", js: "totalRecords", typ: u(undefined, u(0, null)) },
    ], "any"),
    "Datum": o([
        { json: "imageUrl", js: "imageUrl", typ: u(undefined, u(null, "")) },
        { json: "isJxhy", js: "isJxhy", typ: u(undefined, u(true, null)) },
        { json: "monthSold", js: "monthSold", typ: u(undefined, u(0, null)) },
        { json: "offerId", js: "offerId", typ: u(undefined, u(0, null)) },
        { json: "priceInfo", js: "priceInfo", typ: u(undefined, r("PriceInfo")) },
        { json: "repurchaseRate", js: "repurchaseRate", typ: u(undefined, u(null, "")) },
        { json: "subject", js: "subject", typ: u(undefined, u(null, "")) },
        { json: "subjectTrans", js: "subjectTrans", typ: u(undefined, u(null, "")) },
    ], "any"),
    "PriceInfo": o([
        { json: "jxhyPrice", js: "jxhyPrice", typ: u(undefined, u(null, "")) },
        { json: "pfJxhyPrice", js: "pfJxhyPrice", typ: u(undefined, u(null, "")) },
        { json: "price", js: "price", typ: u(undefined, u(null, "")) },
    ], "any"),
};

module.exports = {
    "apifoxModelToJson": apifoxModelToJson,
    "toApifoxModel": toApifoxModel,
};
