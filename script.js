const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");

const markdownToHtml = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
## Especialidade
Você é um especialista assistente de meta para o jogo ${game}

## Tarefa
Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

## Regras
- Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
- Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
- Considere a data atual ${new Date().toLocaleDateString()}
- Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
- Nunca responda itens que você não tenha certeza de que existem no patch atual.

## Resposta
- Economize na resposta, seja direto e responda no máximo 500 caracteres
- Responda em markdown
- Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

## Exemplo de resposta
pergunta do usuário: Melhor build rengar jungle
resposta: A build mais atual é:\n\n**Itens:**\n\ncoloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

---
Aqui está a pergunta do usuário: ${question}
`;

  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
    }),
  });

  const data = await response.json();

  if (
    !data.candidates ||
    !data.candidates[0] ||
    !data.candidates[0].content
  ) {
    throw new Error("Erro na resposta da API");
  }

  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey === "" || game === "" || question === "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    console.log("Resposta da IA:", text);

    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHtml(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.error("Erro ao chamar a API:", error);
    alert("Erro ao buscar resposta da IA. Verifique a chave da API.");
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
