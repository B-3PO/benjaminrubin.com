import { Component } from '@thewebformula/lithe';
import htmlTemplate from './page.html';

export default class extends Component {
  static title = 'Time warp';
  static htmlTemplate = htmlTemplate;

  player;


  constructor() {
    super();
  }

  load(site) {
    this.initRuffle();
    this.player.config.base = `/flash/${site}/`;
    if (site === '2009') {
      this.player.style.maxWidth = '1150px';
      this.player.style.maxHeight = '600px';
    }
    else {
      this.player.style.maxWidth = '';
      this.player.style.maxHeight = '';
    }

    this.player.load({
      url: `/flash/${site}/site.swf`
    });
  }
  
  initRuffle() {
    if (this.player) return;

    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    const container = document.querySelector('.site-container');
    container.appendChild(player);
    player.style.height = "100%";
    player.style.width = "100%";
    this.player = player;
  }
}
