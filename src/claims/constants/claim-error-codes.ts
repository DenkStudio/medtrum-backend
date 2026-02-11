import { SupplyType, ClaimErrorCode } from "@prisma/client";

export const CLAIM_ERROR_CODES_BY_CATEGORY: Record<
  SupplyType,
  ClaimErrorCode[]
> = {
  [SupplyType.SENSOR]: [
    ClaimErrorCode.SENSOR_FALLA,
    ClaimErrorCode.SENSOR_FALTA_ADHESIVO,
    ClaimErrorCode.SENSOR_DIFERENCIA_CAPILAR,
    ClaimErrorCode.SENSOR_PERDIDO,
    ClaimErrorCode.SENSOR_DESCONOCIDO,
    ClaimErrorCode.SENSOR_SANGRADO_COLOCACION,
    ClaimErrorCode.SENSOR_OTROS,
  ],
  [SupplyType.PARCHE_200U]: [
    ClaimErrorCode.PARCHE_FALTA_ADHESIVO,
    ClaimErrorCode.PARCHE_ERROR,
    ClaimErrorCode.PARCHE_OBSTRUCCION,
    ClaimErrorCode.PARCHE_BATERIA_AGOTADA,
    ClaimErrorCode.PARCHE_ERROR_CEBADO,
    ClaimErrorCode.PARCHE_DESACTIVADO,
    ClaimErrorCode.PARCHE_OTROS,
  ],
  [SupplyType.PARCHE_300U]: [
    ClaimErrorCode.PARCHE_FALTA_ADHESIVO,
    ClaimErrorCode.PARCHE_ERROR,
    ClaimErrorCode.PARCHE_OBSTRUCCION,
    ClaimErrorCode.PARCHE_BATERIA_AGOTADA,
    ClaimErrorCode.PARCHE_ERROR_CEBADO,
    ClaimErrorCode.PARCHE_DESACTIVADO,
    ClaimErrorCode.PARCHE_OTROS,
  ],
  [SupplyType.TRANSMISOR]: [
    ClaimErrorCode.TRANSMISOR_CONECTORES_OXIDADOS,
    ClaimErrorCode.TRANSMISOR_LUZ_VERDE_NO_PARPADEA,
    ClaimErrorCode.TRANSMISOR_PROBLEMAS_BATERIA,
    ClaimErrorCode.TRANSMISOR_ROTURA,
    ClaimErrorCode.TRANSMISOR_OTROS,
  ],
  [SupplyType.BASE_BOMBA_200U]: [
    ClaimErrorCode.BASE_BOMBA_CONECTORES_OXIDADOS,
    ClaimErrorCode.BASE_BOMBA_NO_ENCASTRA,
    ClaimErrorCode.BASE_BOMBA_NO_HACE_PITIDOS,
    ClaimErrorCode.BASE_BOMBA_ROTURA,
    ClaimErrorCode.BASE_BOMBA_OTROS,
  ],
  [SupplyType.BASE_BOMBA_300U]: [
    ClaimErrorCode.BASE_BOMBA_CONECTORES_OXIDADOS,
    ClaimErrorCode.BASE_BOMBA_NO_ENCASTRA,
    ClaimErrorCode.BASE_BOMBA_NO_HACE_PITIDOS,
    ClaimErrorCode.BASE_BOMBA_ROTURA,
    ClaimErrorCode.BASE_BOMBA_OTROS,
  ],
  [SupplyType.CABLE_TRANSMISOR]: [
    ClaimErrorCode.CABLE_NO_CARGA,
    ClaimErrorCode.CABLE_PIN_DOBLADO,
    ClaimErrorCode.CABLE_OTROS,
  ],
  [SupplyType.PDM]: [
    ClaimErrorCode.PDM_NO_CARGA_NO_ENCIENDE,
    ClaimErrorCode.PDM_SE_APAGA_SOLO,
    ClaimErrorCode.PDM_NO_CARGA,
    ClaimErrorCode.PDM_ROTURA,
    ClaimErrorCode.PDM_OTROS,
  ],
};
