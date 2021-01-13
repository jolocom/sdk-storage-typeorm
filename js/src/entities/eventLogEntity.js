"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogEntity = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let EventLogEntity = class EventLogEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryColumn({ length: 100 }),
    tslib_1.__metadata("design:type", String)
], EventLogEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column("text"),
    tslib_1.__metadata("design:type", String)
], EventLogEntity.prototype, "eventStream", void 0);
EventLogEntity = tslib_1.__decorate([
    typeorm_1.Entity('event_log')
], EventLogEntity);
exports.EventLogEntity = EventLogEntity;
