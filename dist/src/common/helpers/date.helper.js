"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
function parseDate(dateStr) {
    const date = new Date(dateStr);
    date.setUTCHours(12, 0, 0, 0);
    return date;
}
//# sourceMappingURL=date.helper.js.map