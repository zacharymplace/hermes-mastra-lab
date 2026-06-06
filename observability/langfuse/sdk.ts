import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

let sdk: NodeSDK | null = null;

export async function startLangfuseSdk() {
  if (sdk) {
    return sdk;
  }

  sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()]
  });

  await sdk.start();

  console.log(
    JSON.stringify(
      {
        runtime: "langfuse-otel-sdk",
        status: "started"
      },
      null,
      2
    )
  );

  return sdk;
}

export async function stopLangfuseSdk() {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
}
