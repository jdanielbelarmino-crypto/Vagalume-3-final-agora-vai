# Vagalume Multiplayer (Node.js)

Servidor Node.js + Socket.IO para salas multiplayer do jogo Vagalume (até 5 jogadores), pronto para o Render.

## Novidades da versão 1.3 — heróis totalmente diferentes

Cada um dos 12 heróis agora tem **corpo, animação, Impulso e passiva próprios**:

| Herói | Visual e animação | Impulso (Espaço/Shift) | Passiva |
|---|---|---|---|
| Vaga | pequena, lanterna gigante numa vara que balança e avança ao atacar | Rastro de luz: poças de luz que queimam | Luz viva: luz 22% maior que queima de leve quem chega perto |
| Lia | alta e esguia, capa longa ao vento, puxa a corda do arco | Salto da águia: pula e solta 3 flechas | +12% crítico, mais veloz, flechas atravessam +1, menos vida |
| Bento | largo e pesado, passo de armadura, escudo-torre | Investida de escudo: imune, empurra e atordoa | +30 vida, 16% menos dano, contra-ataque ao ser ferido, mais lento |
| Mara | flutua num vestido longo com pétalas de luz | Passo da aurora: teletransporte que deixa chão de cura | Regenera, cura aliados, ímã maior, menos vida |
| Pipa | redonda e baixinha, mochila de bombas faiscando | Salto-foguete: bombas na saída e na chegada | Estopim: 13% dos abates explodem |
| Tito | agachado e furtivo, poncho e chapéu largo | Rolamento: deixa armadilhas | +10% velocidade, +20% ouro, mais armadilhas |
| Íris | flutua sem pernas, cauda de névoa, lobinho ao lado | Passo espectral: atravessa e solta vagalumes | Lobinho espiritual que caça e morde sozinho |
| Ravi | monge de túnica larga, contas girando, faíscas nas mãos | Relâmpago: teletransporte em raio que fere o caminho | Carga estática: a cada 7 abates cai um raio |
| Nina | pequena, mochila com antena, braço mecânico e drone | Propulsor: voa e deixa uma torreta | +1 torreta, duram mais, menos vida |
| Dom | o mais alto, ombreiras pontudas, capa, auréola e martelo | Investida sagrada: imune, termina em explosão | +10% dano, +15 vida, cura com abates, mais lento |
| Kael | esguio, cachecol longo, imagens residuais ao correr | Corte-relâmpago: corta tudo no caminho, recarga mínima | Ritmo de batalha: ataque rápido, abates recarregam o Impulso |
| Sol | cabelo em chamas, barra de fogo, brasas e orbe solar | Passo de fogo: rastro de chamas | Brasa viva: +12% dano, abates deixam fogo no chão |

No online, os outros jogadores veem o Impulso de cada um.

## Novidades da versão 1.2

- **12 heróis, cada um com um super único** e uma animação de super em tela (faixa com o nome do herói, flash e efeitos próprios): Vaga (Supernova), Lia (Chuva de estrelas), Bento (Bastião sagrado), Mara (Bênção da aurora), Pipa (Bombardeio), Tito (Teia dourada), Íris (Matilha espectral), Ravi (Fúria do trovão), Nina (Protocolo Titã), Dom (Juízo sagrado) e os novos **Kael** (Corte dimensional) e **Sol** (Meteoro solar).
- **O super sempre é o do herói escolhido** (no online, o herói escolhido na sala). Os outros jogadores veem a animação do seu super.
- **Cura online corrigida:** Mara (super e passiva) cura aliados online, levanta quem caiu e deixa uma zona de regeneração; o escudo do Bento também protege os aliados online. Raios, bombas e demais habilidades foram revisados.
- **10 noites** (eram 6), cada uma com cenário, chefe e monstros próprios: Dunas Esquecidas, Caverna de Cristal, Vulcão Ardente e Cidadela Estelar, além de 19 monstros e chefes novos.
- **Desbloqueio de noites pelo progresso salvo no aparelho:** a noite seguinte libera ao passar da metade do tempo da noite atual ou ao vencer. Noites trancadas mostram o motivo ao tocar, e as vencidas ganham ✓. Se o navegador não permitir salvar (aba anônima), o jogo avisa.
- Crédito: "Feito por João Daniel Belarmino" no menu, na pausa, nas telas finais e discreto na tela de jogo.

## Versão 1.1

- **Monstros iguais para todos, ao vivo.** Quem começou a partida (o "host") simula os monstros; os outros recebem a posição deles ~10x por segundo e mandam o dano que causam. Se o host sair ou travar (aba em segundo plano), o servidor passa o posto para outro jogador sem interromper a partida.
- **Dificuldade menor no online:** monstros com menos vida, mais lentos, que causam menos dano e nascem em menor ritmo; cada abate dá mais experiência.
- **Heróis de graça no online.** A escolha online não altera o herói da campanha.
- **Reviver:** o aliado levanta quem caiu ao encostar (0,3 s), e quem caiu volta sozinho em 8 s. A partida só acaba se todos caírem ao mesmo tempo. O level-up online não congela mais o mundo.
- **Clarão** (herói Vaga) recarrega em 14 s (era 34 s).
- **Fim do tempo = vitória:** ao zerar o relógio aparece "Sobreviveu!" com animação. No jogo solo ainda dá para continuar para a próxima noite.
- **Limite do mapa:** arena circular com parede de luz; jogadores e monstros não saem dela.

## Rodar localmente

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

## Publicar no Render

1. Suba o conteúdo deste zip (todos os arquivos na raiz, incluindo o `index.html`) para um repositório, ou use "Deploy from a Git repo".
2. O `render.yaml` já define o serviço: build `npm install`, start `npm start`, health check `/health`.
3. Use o endereço público HTTPS (ex.: `https://seu-jogo.onrender.com`) e passe o código da sala para os amigos.

No plano gratuito o Render "dorme" após alguns minutos sem acesso; a primeira conexão pode demorar até um minuto.

## Observações

- Salas e jogadores ficam em memória; reiniciar o servidor encerra as salas.
- Para produção, restrinja o CORS ao domínio do jogo em `server.js`.
