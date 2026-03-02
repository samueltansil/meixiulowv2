import * as ReactHelmetAsync from "react-helmet-async";

const helmetModule: any = ReactHelmetAsync;

export const Helmet = helmetModule.Helmet || helmetModule.default?.Helmet;
export const HelmetProvider = helmetModule.HelmetProvider || helmetModule.default?.HelmetProvider;
