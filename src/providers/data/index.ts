import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider,
} from "@refinedev/nestjs-query";

import { createClient } from "graphql-ws";

import { axiosInstance } from "./axios";

export const API_BASE_URL = "https://api.crm.refine.dev";
export const API_URL = `${API_BASE_URL}/graphql`;
export const WS_URL = "wss://api.crm.refine.dev/graphql";

// Helper function to convert Axios response to Fetch response-like structure
const axiosFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const { body, ...options } = init || {};

  const requestConfig = {
    url: typeof input === 'string' ? input : input.toString(),
    method: options.method,
    headers: options.headers as Record<string, string>,
    data: body as
        | ReadableStream<any>
        | Blob
        | ArrayBufferView
        | ArrayBuffer
        | FormData
        | URLSearchParams
        | string
        | null
        | undefined,
  };

  try {
    const response = await axiosInstance.request(requestConfig);
    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as unknown as HeadersInit,
    });
  } catch (error: any) {
    const messages = error.response?.data?.errors?.map((err: any) => err.message)?.join("") || error.message;
    const statusCode = error.response?.status || 500;

    return new Response(null, {
      status: statusCode,
      statusText: messages,
    });
  }
};

export const client = new GraphQLClient(API_URL, {
  fetch: axiosFetch,
});

export const wsClient = createClient({
  url: WS_URL,
  connectionParams: () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }),
});

export const dataProvider = graphqlDataProvider(client);

export const liveProvider = graphqlLiveProvider(wsClient);
