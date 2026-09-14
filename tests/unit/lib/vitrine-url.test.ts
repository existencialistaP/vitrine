import { describe, expect, it } from "vitest";

import { buildVitrineUrl } from "@/lib/vitrine-url";

describe("buildVitrineUrl", () => {
  it("monta URL absoluta a partir do host da requisição", () => {
    expect(
      buildVitrineUrl({ host: "vitrine.app", forwardedProto: null }, "doce-e-tal")
    ).toBe("https://vitrine.app/doce-e-tal");
  });

  it("usa x-forwarded-proto quando presente (proxy/https)", () => {
    expect(
      buildVitrineUrl(
        { host: "vitrine.app", forwardedProto: "https" },
        "doce-e-tal"
      )
    ).toBe("https://vitrine.app/doce-e-tal");
  });

  it("usa http em localhost sem proxy", () => {
    expect(
      buildVitrineUrl(
        { host: "localhost:3000", forwardedProto: null },
        "doce-e-tal"
      )
    ).toBe("http://localhost:3000/doce-e-tal");
  });

  it("usa http em 127.0.0.1 sem proxy", () => {
    expect(
      buildVitrineUrl({ host: "127.0.0.1:3000", forwardedProto: null }, "loja")
    ).toBe("http://127.0.0.1:3000/loja");
  });

  it("ignora valores encadeados de x-forwarded-proto", () => {
    expect(
      buildVitrineUrl(
        { host: "vitrine.app", forwardedProto: "https,http" },
        "loja"
      )
    ).toBe("https://vitrine.app/loja");
  });

  it("ignora protocolos inesperados e cai no padrão por host", () => {
    expect(
      buildVitrineUrl(
        { host: "vitrine.app", forwardedProto: "ftp" },
        "loja"
      )
    ).toBe("https://vitrine.app/loja");
    expect(
      buildVitrineUrl({ host: "localhost:3000", forwardedProto: "ftp" }, "loja")
    ).toBe("http://localhost:3000/loja");
  });

  it("retorna null sem host (requisição sem contexto HTTP)", () => {
    expect(buildVitrineUrl({ host: null, forwardedProto: "https" }, "loja")).toBeNull();
    expect(buildVitrineUrl({ host: "", forwardedProto: "https" }, "loja")).toBeNull();
  });
});
