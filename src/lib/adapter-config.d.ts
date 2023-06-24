// This file extends the AdapterConfig type from "@types/iobroker"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            enableAlarms: boolean;
            enableArming: boolean;
            enableDisarming: boolean;
            host: string;
            port: number;
            secureToken: string;
            userPinCode: string;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
