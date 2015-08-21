/ left/right=steer up=thrust down=fire
wh:(w;h);C:wh%2 / dimensions and centre of universe
trg:(cos;sin)@\:;sq:{x*x} / helper functions
Sp:C;Sv:0 0;Sh:0 / spaceship's position, velocity, and heading
An:3;As:An#3;Av:+trg.0628*An?100 / asteroids: number, sizes, velocities
Ap:C+/:(&/C)*+trg.0628*An?100 / asteroid positions
Bp:Bv:Bt:() / bullets' positions, velocities, times left (in ticks)
Br:0 / time until spaceship can fire again (in ticks)
P:("#000";"#fff";"#888";"#f00";"#00f") / palette
msg:" " / message
draw:{
  t:trg Sh;T:-1 1*|t
  r:(,:'Sp+/:(2*t;-t;T-2*t;-T+2*t)),\:(P;1) / spaceship
  r,:,(Sp-2*t;P;3*0>dir 1) / exhaust fire
  r,:(,:'Ap-As%2),'`P,',:'(2#'As)#'2 / asteroids
  r,:(,:'Bp),\:(P;4) / bullets
  r,:,(0 0;P;~,/'+text@`i$msg)
}
tick:{
  $[~#Ap;(msg::"you win";tick::{});0] / no asteroids left?
  $[|/0,25>+/'sq Sp-/:Ap;(msg::"you lose";tick::{});0] / spaceship-asteroid collision
  Sh+::.1**dir / steer
  Sv+::(trg Sh)*.1*0>dir 1 / thrust
  Sp::wh!'Sp+Sv / move spaceship
  Ap::wh!'/:Ap+Av / move asteroids
  Bp::wh!'/:Bp+Bv / move bullets
  $[(~Br)&0<dir 1;fire[];Br::0|Br-1] / fire
  c:9<+/''sq Ap-/:\:Bp / bullet-asteroid collisions
  i:&(&/c)&(Bt-::1)>0;Bp@::i;Bv@::i;Bt@::i / rm expired and impacting bullets
  m:&/'c;i:&m;j:&2*~m|As=1 / indices of surviving(i) and splitting(j) asteroids
  Ap::Ap i,j;Av::(Av i),((#j)#(1 -1;-1 1))*|:'Av j;As::(As i),-1+As j
}
fire:{Bp,::,Sp+3*trg Sh;Bv,::,1.5*trg Sh;Bt,::100;Br::10}
