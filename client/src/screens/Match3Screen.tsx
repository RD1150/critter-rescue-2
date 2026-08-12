// ─────────────────────────────────────────────
// Match3Screen — Phaser-powered match-3 bonus game
// Embedded as an iframe-like full-screen canvas
// ─────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { playButton } from '../game/sounds';

interface Props {
  onClose: () => void;
  critterName: string;
  critterEmoji: string;
}

const GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#1F4216;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
#gc{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
canvas{display:block;touch-action:none}
</style>
</head>
<body><div id="gc"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
const TILE_TYPES={food:{color:0xE8A87C,icon:'🍎'},water:{color:0x7EC8E3,icon:'💧'},warmth:{color:0xF8B595,icon:'🔥'},love:{color:0xF5A6C8,icon:'💕'},herbs:{color:0x9DC88D,icon:'🌿'}};
const TILE_KEYS=Object.keys(TILE_TYPES);
const W=Math.min(window.innerWidth,400),H=Math.min(window.innerHeight,700);
const GS=7,TS=Math.floor((Math.min(W,H)*0.85)/GS),SP=2,CS=TS+SP;

class GameScene extends Phaser.Scene{
  constructor(){super({key:'GameScene'});this.grid=[];this.score=0;this.moves=20;this.wellness=0;this.goal=80;this.processing=false;}
  create(){
    const {width:w,height:h}=this.cameras.main;
    this.add.rectangle(w/2,h/2,w,h,0x1F4216);
    // Header
    this.add.rectangle(w/2,45,w,90,0x2D5A1E,0.95);
    this.scoreText=this.add.text(16,14,'Score: 0',{fontSize:'14px',fontFamily:'sans-serif',color:'#F5EDE0',fontStyle:'bold'});
    this.movesText=this.add.text(w/2,28,this.moves+' moves',{fontSize:'16px',fontFamily:'sans-serif',color:'#F5C842',fontStyle:'bold'}).setOrigin(0.5);
    this.add.text(w/2,58,'Wellness',{fontSize:'11px',fontFamily:'sans-serif',color:'rgba(245,237,224,0.6)'}).setOrigin(0.5);
    const bw=Math.min(w-40,280),bx=w/2;
    this.add.rectangle(bx,72,bw,12,0x3E6B2F).setStrokeStyle(1,0x4A7A35);
    this.wellBar=this.add.rectangle(bx-bw/2,72,0,10,0xE66B5B).setOrigin(0,0.5);
    this.wellBarW=bw;
    this.goalLine=this.add.rectangle(bx-bw/2+bw*this.goal/100,72,2,18,0xF5C842);
    this.wellText=this.add.text(bx+bw/2+8,72,'0%',{fontSize:'11px',fontFamily:'sans-serif',color:'#F5EDE0',fontStyle:'bold'}).setOrigin(0,0.5);
    // Grid
    this.gx=(w-GS*CS)/2+CS/2;
    this.gy=100+CS/2;
    this.add.rectangle(w/2,this.gy+GS*CS/2-CS/2,GS*CS+12,GS*CS+12,0x2D5A1E,0.6).setStrokeStyle(1,0x4A7A35);
    for(let r=0;r<GS;r++){this.grid[r]=[];for(let c=0;c<GS;c++)this.grid[r][c]=null;}
    for(let r=0;r<GS;r++)for(let c=0;c<GS;c++)this.makeTile(r,c,true);
    // Bottom hint
    this.add.text(w/2,h-20,'Tap groups of 2+ matching tiles',{fontSize:'11px',fontFamily:'sans-serif',color:'rgba(245,237,224,0.5)'}).setOrigin(0.5);
    // Close button
    const closeBtn=this.add.text(w-16,14,'✕',{fontSize:'20px',fontFamily:'sans-serif',color:'rgba(245,237,224,0.7)'}).setOrigin(1,0).setInteractive({useHandCursor:true});
    closeBtn.on('pointerdown',()=>window.parent.postMessage({type:'CLOSE_MATCH3'},'*'));
  }
  makeTile(r,c,anim){
    const key=Phaser.Math.RND.pick(TILE_KEYS);
    const t=TILE_TYPES[key];
    const x=this.gx+c*CS,ty=this.gy+r*CS;
    const sy=anim?this.gy-40-(GS-r)*20:ty;
    const cont=this.add.container(x,sy);
    const bg=this.add.rectangle(0,0,TS,TS,t.color,1).setStrokeStyle(1.5,this.darken(t.color,20)).setInteractive({useHandCursor:true});
    const icon=this.add.text(0,0,t.icon,{fontSize:Math.floor(TS*0.55)+'px'}).setOrigin(0.5);
    cont.add([bg,icon]);
    cont.setData({r,c,type:key,bg});
    bg.on('pointerdown',()=>this.tap(cont));
    bg.on('pointerover',()=>!this.processing&&this.hl(r,c,key));
    bg.on('pointerout',()=>this.clearHL());
    this.grid[r][c]=cont;
    if(anim)this.tweens.add({targets:cont,y:ty,duration:220+r*30,ease:'Bounce.easeOut',delay:c*20});
  }
  tap(tile){
    if(this.processing||this.moves<=0)return;
    const{r,c,type}=tile.getData(['r','c','type']);
    const conn=this.connected(r,c,type);
    if(conn.length>=2)this.clear(conn);
    else this.tweens.add({targets:tile,x:tile.x-4,duration:40,yoyo:true,repeat:3});
  }
  connected(r,c,type,vis=new Set()){
    const k=r+','+c;
    if(vis.has(k)||r<0||r>=GS||c<0||c>=GS)return[];
    const t=this.grid[r][c];
    if(!t||t.getData('type')!==type)return[];
    vis.add(k);
    let res=[{r,c,tile:t}];
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{res=res.concat(this.connected(r+dr,c+dc,type,vis));});
    return res;
  }
  hl(r,c,type){
    const conn=this.connected(r,c,type);
    if(conn.length>=2)conn.forEach(({tile})=>{tile.getData('bg').setStrokeStyle(2.5,0xF5C842);tile.setScale(1.07);});
  }
  clearHL(){
    for(let r=0;r<GS;r++)for(let c=0;c<GS;c++){const t=this.grid[r][c];if(t){t.getData('bg').setStrokeStyle(1.5,this.darken(TILE_TYPES[t.getData('type')].color,20));t.setScale(1);}}
  }
  clear(conn){
    this.processing=true;
    this.moves--;
    this.movesText.setText(this.moves+' moves');
    if(this.moves<=5)this.movesText.setColor('#E66B5B');
    const pts=conn.length*10+(conn.length>3?(conn.length-3)*15:0);
    this.score+=pts;
    this.scoreText.setText('Score: '+this.score);
    this.wellness=Math.min(100,this.wellness+conn.length*4);
    this.tweens.add({targets:this.wellBar,width:this.wellBarW*this.wellness/100,duration:250});
    this.wellText.setText(Math.floor(this.wellness)+'%');
    if(this.wellness>=this.goal)this.wellBar.setFillStyle(0x6ABB6A);
    const mid=conn[Math.floor(conn.length/2)];
    const ft=this.add.text(mid.tile.x,mid.tile.y,'+'+pts,{fontSize:'20px',fontFamily:'sans-serif',color:'#F5C842',fontStyle:'bold'}).setOrigin(0.5);
    this.tweens.add({targets:ft,y:ft.y-45,alpha:0,duration:650,onComplete:()=>ft.destroy()});
    let d=0;
    conn.forEach(({r,c,tile})=>{
      this.time.delayedCall(d,()=>this.tweens.add({targets:tile,scale:0,alpha:0,duration:110,ease:'Back.easeIn',onComplete:()=>tile.destroy()}));
      this.grid[r][c]=null;d+=22;
    });
    this.time.delayedCall(d+130,()=>this.drop());
  }
  drop(){
    for(let c=0;c<GS;c++){let e=0;for(let r=GS-1;r>=0;r--){if(!this.grid[r][c])e++;else if(e>0){const t=this.grid[r][c];const nr=r+e;this.grid[nr][c]=t;this.grid[r][c]=null;t.setData('r',nr);this.tweens.add({targets:t,y:this.gy+nr*CS,duration:160+e*35,ease:'Bounce.easeOut'});}}}
    this.time.delayedCall(180,()=>this.refill());
  }
  refill(){
    for(let c=0;c<GS;c++)for(let r=0;r<GS;r++)if(!this.grid[r][c])this.makeTile(r,c,true);
    this.time.delayedCall(420,()=>{
      this.processing=false;
      if(this.wellness>=this.goal){this.time.delayedCall(300,()=>this.win());}
      else if(this.moves<=0){this.time.delayedCall(300,()=>this.lose());}
      else if(!this.hasMoves())this.shuffle();
    });
  }
  hasMoves(){for(let r=0;r<GS;r++)for(let c=0;c<GS;c++){const t=this.grid[r][c];if(t&&this.connected(r,c,t.getData('type')).length>=2)return true;}return false;}
  shuffle(){
    this.processing=true;
    const tiles=[];
    for(let r=0;r<GS;r++)for(let c=0;c<GS;c++){if(this.grid[r][c]){tiles.push(this.grid[r][c]);this.grid[r][c]=null;}}
    Phaser.Utils.Array.Shuffle(tiles);
    let i=0;
    for(let r=0;r<GS;r++)for(let c=0;c<GS;c++){if(i<tiles.length){const t=tiles[i];t.setData({r,c});this.grid[r][c]=t;this.tweens.add({targets:t,x:this.gx+c*CS,y:this.gy+r*CS,duration:300,ease:'Cubic.easeOut',delay:i*6});i++;}}
    this.time.delayedCall(450,()=>{this.processing=false;if(!this.hasMoves())this.forceMatch();});
  }
  forceMatch(){
    const r=Phaser.Math.Between(0,GS-2),c=Phaser.Math.Between(0,GS-2);
    const t=this.grid[r][c],n=this.grid[r][c+1]||this.grid[r+1][c];
    if(t&&n){const type=t.getData('type');n.setData('type',type);n.getData('bg').setFillStyle(TILE_TYPES[type].color);n.list[1].setText(TILE_TYPES[type].icon);}
  }
  win(){
    const{width:w,height:h}=this.cameras.main;
    this.add.rectangle(w/2,h/2,w,h,0x000000,0.5);
    this.add.text(w/2,h/2-60,'🌟',{fontSize:'60px'}).setOrigin(0.5);
    this.add.text(w/2,h/2+10,'Critter Healed!',{fontSize:'28px',fontFamily:'sans-serif',color:'#F5C842',fontStyle:'bold'}).setOrigin(0.5);
    this.add.text(w/2,h/2+50,'Score: '+this.score,{fontSize:'18px',fontFamily:'sans-serif',color:'#F5EDE0'}).setOrigin(0.5);
    const btn=this.add.rectangle(w/2,h/2+110,200,48,0xE66B5B).setInteractive({useHandCursor:true});
    this.add.text(w/2,h/2+110,'Play Again',{fontSize:'18px',fontFamily:'sans-serif',color:'#FFF',fontStyle:'bold'}).setOrigin(0.5);
    btn.on('pointerdown',()=>this.scene.restart());
    const close=this.add.rectangle(w/2,h/2+170,200,48,0x2D5A1E).setStrokeStyle(1,0x4A7A35).setInteractive({useHandCursor:true});
    this.add.text(w/2,h/2+170,'Back to Camp',{fontSize:'18px',fontFamily:'sans-serif',color:'#F5EDE0',fontStyle:'bold'}).setOrigin(0.5);
    close.on('pointerdown',()=>window.parent.postMessage({type:'CLOSE_MATCH3'},'*'));
  }
  lose(){
    const{width:w,height:h}=this.cameras.main;
    this.add.rectangle(w/2,h/2,w,h,0x000000,0.45);
    this.add.text(w/2,h/2-60,'🌙',{fontSize:'54px'}).setOrigin(0.5);
    this.add.text(w/2,h/2+10,'Needs more care…',{fontSize:'24px',fontFamily:'sans-serif',color:'#F5EDE0',fontStyle:'bold'}).setOrigin(0.5);
    const btn=this.add.rectangle(w/2,h/2+80,200,48,0xE66B5B).setInteractive({useHandCursor:true});
    this.add.text(w/2,h/2+80,'Try Again',{fontSize:'18px',fontFamily:'sans-serif',color:'#FFF',fontStyle:'bold'}).setOrigin(0.5);
    btn.on('pointerdown',()=>this.scene.restart());
    const close=this.add.rectangle(w/2,h/2+140,200,48,0x2D5A1E).setStrokeStyle(1,0x4A7A35).setInteractive({useHandCursor:true});
    this.add.text(w/2,h/2+140,'Back to Camp',{fontSize:'18px',fontFamily:'sans-serif',color:'#F5EDE0',fontStyle:'bold'}).setOrigin(0.5);
    close.on('pointerdown',()=>window.parent.postMessage({type:'CLOSE_MATCH3'},'*'));
  }
  darken(color,amt){let r=(color>>16)&0xFF,g=(color>>8)&0xFF,b=color&0xFF;return(Math.max(0,r-amt)<<16)|(Math.max(0,g-amt)<<8)|Math.max(0,b-amt);}
}

const config={type:Phaser.AUTO,parent:'gc',width:W,height:H,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},backgroundColor:'#1F4216',scene:[GameScene],render:{antialias:true,roundPixels:true}};
window.addEventListener('load',()=>new Phaser.Game(config));
</script></body></html>`;

export default function Match3Screen({ onClose, critterName, critterEmoji }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'CLOSE_MATCH3') onClose();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onClose]);

  return (
    <div className="game-screen bg-[#1F4216]">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-[#1F4216]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{critterEmoji}</span>
          <span className="font-display text-white font-bold text-sm">Heal {critterName}</span>
        </div>
        <button onClick={() => { playButton(); onClose(); }} className="text-white/60 hover:text-white text-sm font-body px-3 py-1 rounded-lg border border-white/20">
          ✕ Exit
        </button>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={GAME_HTML}
        className="absolute inset-0 w-full h-full border-0"
        style={{ marginTop: 0 }}
        title="Match-3 Rescue Game"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

