"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statuspage = void 0;
const axios_1 = require("axios");
const url_1 = require("url");
const api_1 = require("./api");
const Endpoints_1 = require("./Endpoints");
class Statuspage {
    constructor(pageId) {
        /**
         * Get the components for the page. Each component is listed along with its status -
         * one of `operational`, `degraded_performance`, `partial_outage`, or `major_outage`.
         */
        this.getComponents = () => __awaiter(this, void 0, void 0, function* () {
            const endpoint = Endpoints_1.Endpoint.components();
            const { data } = yield this.apiClient.get(endpoint);
            return data;
        });
        /**
         * Get the status rollup for the whole page. This endpoint includes an indicator -
         * one of `none`, `minor`, `major`, or `critical`, as well as a human description of the
         * blended component status. Examples of the blended status include "All Systems
         * Operational", "Partial System Outage", and "Major Service Outage".
         */
        this.getStatus = () => __awaiter(this, void 0, void 0, function* () {
            const endpoint = Endpoints_1.Endpoint.status();
            const { data } = yield this.apiClient.get(endpoint);
            return data;
        });
        /**
         * Get a summary of the status page, including a status indicator, component statuses,
         * unresolved incidents, and any upcoming or in-progress scheduled maintenances.
         */
        this.getSummary = () => __awaiter(this, void 0, void 0, function* () {
            const endpoint = Endpoints_1.Endpoint.summary();
            const { data } = yield this.apiClient.get(endpoint);
            return data;
        });
        // if (pageId) {
        //     throw new Error('A page ID needs to be set in order to use the client.');
        // }
        const apiUrl = new url_1.URL(`https://${pageId}.statuspage.io`);
        this.apiClient = axios_1.default.create({
            baseURL: apiUrl.href,
        });
        this.api = {
            getComponents: this.getComponents,
            getStatus: this.getStatus,
            getSummary: this.getSummary,
            incidents: new api_1.IncidentsAPI(this.apiClient),
            scheduledMaintenances: new api_1.ScheduledMaintenancesAPI(this.apiClient),
            subscribers: new api_1.SubscribersAPI(this.apiClient),
        };
    }
    /**
     * Set a new API URL.
     * @param newUrl The new API url
     */
    setApiUrl(newUrl) {
        this.apiClient.defaults.baseURL = newUrl;
    }
}
exports.Statuspage = Statuspage;
//# sourceMappingURL=Statuspage.js.map