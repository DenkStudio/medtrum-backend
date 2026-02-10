"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAIM_ERROR_CODES_BY_CATEGORY = void 0;
const client_1 = require("@prisma/client");
exports.CLAIM_ERROR_CODES_BY_CATEGORY = {
    [client_1.ClaimCategory.SENSOR]: [
        client_1.ClaimErrorCode.SENSOR_FALLA,
        client_1.ClaimErrorCode.SENSOR_FALTA_ADHESIVO,
        client_1.ClaimErrorCode.SENSOR_DIFERENCIA_CAPILAR,
        client_1.ClaimErrorCode.SENSOR_PERDIDO,
        client_1.ClaimErrorCode.SENSOR_DESCONOCIDO,
        client_1.ClaimErrorCode.SENSOR_SANGRADO_COLOCACION,
        client_1.ClaimErrorCode.SENSOR_OTROS,
    ],
    [client_1.ClaimCategory.PARCHE_200U]: [
        client_1.ClaimErrorCode.PARCHE_FALTA_ADHESIVO,
        client_1.ClaimErrorCode.PARCHE_ERROR,
        client_1.ClaimErrorCode.PARCHE_OBSTRUCCION,
        client_1.ClaimErrorCode.PARCHE_BATERIA_AGOTADA,
        client_1.ClaimErrorCode.PARCHE_ERROR_CEBADO,
        client_1.ClaimErrorCode.PARCHE_DESACTIVADO,
        client_1.ClaimErrorCode.PARCHE_OTROS,
    ],
    [client_1.ClaimCategory.PARCHE_300U]: [
        client_1.ClaimErrorCode.PARCHE_FALTA_ADHESIVO,
        client_1.ClaimErrorCode.PARCHE_ERROR,
        client_1.ClaimErrorCode.PARCHE_OBSTRUCCION,
        client_1.ClaimErrorCode.PARCHE_BATERIA_AGOTADA,
        client_1.ClaimErrorCode.PARCHE_ERROR_CEBADO,
        client_1.ClaimErrorCode.PARCHE_DESACTIVADO,
        client_1.ClaimErrorCode.PARCHE_OTROS,
    ],
    [client_1.ClaimCategory.TRANSMISOR]: [
        client_1.ClaimErrorCode.TRANSMISOR_CONECTORES_OXIDADOS,
        client_1.ClaimErrorCode.TRANSMISOR_LUZ_VERDE_NO_PARPADEA,
        client_1.ClaimErrorCode.TRANSMISOR_PROBLEMAS_BATERIA,
        client_1.ClaimErrorCode.TRANSMISOR_ROTURA,
        client_1.ClaimErrorCode.TRANSMISOR_OTROS,
    ],
    [client_1.ClaimCategory.BASE_BOMBA_200U]: [
        client_1.ClaimErrorCode.BASE_BOMBA_CONECTORES_OXIDADOS,
        client_1.ClaimErrorCode.BASE_BOMBA_NO_ENCASTRA,
        client_1.ClaimErrorCode.BASE_BOMBA_NO_HACE_PITIDOS,
        client_1.ClaimErrorCode.BASE_BOMBA_ROTURA,
        client_1.ClaimErrorCode.BASE_BOMBA_OTROS,
    ],
    [client_1.ClaimCategory.BASE_BOMBA_300U]: [
        client_1.ClaimErrorCode.BASE_BOMBA_CONECTORES_OXIDADOS,
        client_1.ClaimErrorCode.BASE_BOMBA_NO_ENCASTRA,
        client_1.ClaimErrorCode.BASE_BOMBA_NO_HACE_PITIDOS,
        client_1.ClaimErrorCode.BASE_BOMBA_ROTURA,
        client_1.ClaimErrorCode.BASE_BOMBA_OTROS,
    ],
    [client_1.ClaimCategory.CABLE_TRANSMISOR]: [
        client_1.ClaimErrorCode.CABLE_NO_CARGA,
        client_1.ClaimErrorCode.CABLE_PIN_DOBLADO,
        client_1.ClaimErrorCode.CABLE_OTROS,
    ],
    [client_1.ClaimCategory.PDM]: [
        client_1.ClaimErrorCode.PDM_NO_CARGA_NO_ENCIENDE,
        client_1.ClaimErrorCode.PDM_SE_APAGA_SOLO,
        client_1.ClaimErrorCode.PDM_NO_CARGA,
        client_1.ClaimErrorCode.PDM_ROTURA,
        client_1.ClaimErrorCode.PDM_OTROS,
    ],
};
//# sourceMappingURL=claim-error-codes.js.map