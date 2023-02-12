/*
 *  Nome:					papagaio_bot
 *  Descrição:				Bot pro Discord que captura mensagens de um usuário e o imita (usando markov chain) quando mencionado.
 *  Autor:					Vico
 *  Versão:					0.0.1
 *  Dependências:			discord.js e makrov
*/

/* ---------------- DECLARAÇÕES ---------------- */
const util = require('util');
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const markov = require('markov');

/* ----------------- VARIÁVEIS ----------------- */
const config = require('./config.json');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});
const dados = markov(config.markov.ordem);

/* ------------------ FUNÇÕES ------------------ */
// Remove mentions da mensagem
function remover_mentions(msg)
{
	return msg.replace(/<@(.*?)>/, ""); // Remove QUALQUER mention
}

/* ----------------- CALLBACKS ----------------- */
client.on('ready', () => {
	console.log(`Conectado como ${client.user.tag}!`);
});

/* client.on("messageCreate", function(message) {
	if (message.author.bot) return;
	return message.reply(message.cleanContent.replace(/@/g, ""));                          
}); */

client.on('messageCreate', msg => {
	// Caso a mensagem tenha sido enviada por ele mesmo não faz nada
	if (msg.author.id === client.user.id) return;
	
	// Caso a mensagem tenha vindo do usuário à ser monitorado, salva no arquivo de fonte e à cadeia markov
	if (msg.author.id == config.discord.target_id)
	{
		dados.seed(msg.cleanContent.replace(/@/g, ""));
		fs.appendFile(__dirname + '/fonte.txt', msg.cleanContent.replace(/@/g, "") + '\n', 'utf8', function (err) {
			if (err) throw err;
			console.log('[INFO] Mensagem armazenada no banco de dados!');
		});
	}
	
	// Responde a mensagem se ele for mencionado (e se for uma resposta com ping?)
	if (msg.mentions.has(client.user.id))
	{
		msg.reply(dados.respond(msg.cleanContent.replace(/@/g, "")).join(' '));
	}
});

/* -------------- FLUXO PRINCIPAL -------------- */
// LÊ o arquivo-fonte, e alimenta cada linha no objeto da cadeia
fs.readFileSync(__dirname + '/fonte.txt').toString().split("\n").forEach(function(line, index, arr) {
	if (index === arr.length - 1 && line === "") { return; }
	dados.seed(line);
});
console.log("Dados carregados!");

// Loga no Discord
client.login(config.discord.bot_token);