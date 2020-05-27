/**
  *	PAPAGAIO BOT
  * by VICO
  *
  */

/* Biblotecas */
const fs = require('fs');						// Filesystem
const ini = require('ini');						// Ler arquivos INI
const discord_api = require('discord.js');		// Discord API
const markov = require('markov');				// Markov Chain

/* Config Global */
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

/* Objeto principal do bot */
const bot = new discord_api.Client();

/* Objeto principal do Markov Chain */
var chain_principal = markov(1);				// Objeto de ordem 1

/* Lista inicial de frases para o Makrov Chain aprender */
fs.readFileSync(__dirname + '\\frases.txt').toString().split("\n").forEach(function(line, index, arr) {
	if (index === arr.length - 1 && line === "") { return; }
	chain_principal.seed(line);
});

/* EVENTOS */
// Evento que é executado quando o script é iniciado
bot.once('ready', () => {
	console.log('[INFO] Bot iniciado!');
	console.log('[INFO] Modo de Aprendizado: ' + config.discord.learn_mode);
});

// Quando alguém manda uma mensagem
bot.on('message', message => {
	// Caso seja pingado, responde
	if (message.mentions.has(bot.user)) {
		message.reply(chain_principal.respond(message.content).join(' ')); // Cria uma resposta aleatória e junta as palavaras com espaços
	}
	
	// Caso o modo-aprendizado estiver habilitado e o usuário-alvo envie uma mensagem, registra no arquivo frases.txt para futuras mensaegns (OU já consegue usar? não sei se createReadStream atualiza caso o arquivo seja modificado)
	if (config.discord.learn_mode && (message.author.id == config.discord.target_user)) {
		chain_principal.seed(message.content);
		fs.appendFile('frases.txt', message.content + '\n', 'utf8', function (err) {
			if (err) throw err;
			console.log('[INFO] Mensagem armazenada no banco de dados!');
		});
	};
});

/* Loga no Discord com o token presente na config */
bot.login(config.discord.bot_token);