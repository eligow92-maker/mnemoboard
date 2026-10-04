import { ApiClientError } from "./api-client";

const FILE_NAME_PATTERN = /filename="([^"]+)"/;

// Pobiera odpowiedź API jako plik: serwer podaje nazwę w Content-Disposition, a przeglądarka
// zapisuje ją przez tymczasowy odnośnik.
export async function downloadFromApi(path: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(path);
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Brak połączenia z serwerem. Spróbuj ponownie.");
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    throw new ApiClientError(
      response.status,
      payload.code ?? "UNKNOWN_ERROR",
      payload.message ?? "Wystąpił nieoczekiwany błąd",
    );
  }

  const fileName =
    FILE_NAME_PATTERN.exec(response.headers.get("content-disposition") ?? "")?.[1] ??
    "mnemoboard.json";
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
