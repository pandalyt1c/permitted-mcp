import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Enter a valid email.");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "permitted-mcp" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(body.error || "Submission failed. Try again later.");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  }

  return (
    <section className="mt-10 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 md:p-6">
      <h2 className="text-sm md:text-base text-zinc-200">
        Get notified when Permitted ships.
      </h2>
      <p className="mt-2 text-xs md:text-sm text-zinc-500 max-w-2xl">
        Continuous monitoring and audit for production AI agents. Append-only
        log, policy enforcement, compliance evidence packs. One email when v1
        is ready. No marketing list.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          disabled={status === "submitting" || status === "success"}
          placeholder="you@company.com"
          className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 disabled:opacity-60 disabled:hover:bg-zinc-800/60 px-4 py-2 text-xs font-mono text-zinc-200 transition"
        >
          {status === "submitting" ? "submitting..." : status === "success" ? "subscribed" : "notify me"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-3 text-xs text-green-500 font-mono">
          you're on the list. one email when v1 ships.
        </p>
      )}
      {status === "error" && errorMsg && (
        <p className="mt-3 text-xs text-red-400 font-mono">{errorMsg}</p>
      )}
    </section>
  );
}
