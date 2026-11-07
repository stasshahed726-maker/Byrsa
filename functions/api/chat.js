export async function onRequestPost({ request, env }) {
  if (!env.OPENROUTER_API_KEY) {
    return new Response("OPENROUTER_API_KEY не задан", { status: 500 });
  }
  const body = await request.json();
  const payload = {
    model: body.model || "qwen/qwen3-coder:free",
    messages: [
      { role: "system", content: "Ты опытный помощник-программист. Отвечай по делу, код давай в блоках ```." },
      ...(body.messages || []).slice(-30),
    ],
    stream: true,
  };
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream" },
  });
}
