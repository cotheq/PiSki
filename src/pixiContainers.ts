import * as PIXI from "pixi.js-legacy";

const containers: PIXI.Container[] = [];

containers.push(
  (() => {
    const mainContainer = new PIXI.Container();
    const subContainer = new PIXI.Container();
    const g1 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g2 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g3 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g4 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g5 = new PIXI.Graphics();
    const g6 = new PIXI.Graphics();

    g1.eventMode = "static";
    g2.eventMode = "static";

    g1.beginFill("#ff0000").drawEllipse(0, 0, 100, 60).endFill();
    g1.position.set(100, 60);

    g2.beginFill("#0000ff").drawRect(0, 0, 100, 100).endFill();
    g2.position.set(120, 60);
    g2.angle = 30;
    g2.scale.set(2, 1);
    g1.on("pointerdown", () => {
      console.log("g1 pointerdown!");
    });
    g2.on("pointerup", () => {
      console.log("g2 pointerup!");
    });
    g3.lineStyle({
      width: 10,
      color: "#ffffff",
      alpha: 1,
      cap: PIXI.LINE_CAP.ROUND,
    })
      .moveTo(-0, -0)
      .lineTo(150, 100);
    g3.angle = -20;
    g4.lineStyle({
      width: 15,
      color: "#00ff00",
      alpha: 0.7,
      cap: PIXI.LINE_CAP.ROUND,
      join: PIXI.LINE_JOIN.ROUND,
    })
      .moveTo(-100, 0)
      .lineTo(150, -30)
      .lineTo(200, -100)
      .lineTo(150, -100);
    g4.angle = 70;

    subContainer.position.set(300, 200);
    subContainer.addChild(g3, g4, g6);
    mainContainer.addChild(subContainer, g1, g2, g5);

    const texture = PIXI.Texture.from("./cat.png");
    const cat = new PIXI.Sprite(texture);
    cat.width = 100;
    cat.height = 100;

    cat.position.set(300, 200);
    mainContainer.addChild(cat);

    return mainContainer;
  })()
);

containers.push(
  (() => {
    const mainContainer = new PIXI.Container();
    const subContainer = new PIXI.Container();
    const g1 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g2 = new PIXI.Graphics() as PIXI.utils.EventEmitter;
    const g5 = new PIXI.Graphics();
    const g6 = new PIXI.Graphics();

    g1.eventMode = "static";
    g2.eventMode = "static";

    g1.beginFill("#0000aa").drawEllipse(0, 0, 100, 60).endFill();
    g1.position.set(150, 60);

    g2.beginFill("#00ffff").drawRoundedRect(50, 50, 100, 60, 15).endFill();

    g2.position.set(120, 60);
    g2.angle = 60;
    g2.scale.set(2, 1);
    g1.on("pointerdown", () => {
      console.log("g1 pointerdown!");
    });
    g2.on("pointerup", () => {
      console.log("g2 pointerup!");
    });
    g5.beginFill("#c0ffee", 1).drawCircle(200, 200, 70).endFill();
    g5.position.set(0, 0);
    g6.beginFill("#bada55", 0.7).drawEllipse(100, 100, 100, 100).endFill();
    g6.angle = -45;
    subContainer.position.set(300, 200);
    subContainer.addChild(g6);
    mainContainer.addChild(subContainer, g1, g2, g5);

    const catTexture = PIXI.Texture.from("./cat.png");
    const cat = new PIXI.Sprite(catTexture);
    cat.width = 150;
    cat.height = 100;
    cat.angle = 30;
    cat.position.set(400, 200);
    mainContainer.addChild(cat);

    const catTexture2 = PIXI.Texture.from("./cats.webp");
    const cat2 = new PIXI.Sprite(catTexture2);
    cat2.width = 300;
    cat2.height = 100;
    cat2.position.set(350, 0);
    mainContainer.addChild(cat2);

    const createStarPoints = (
      centerX: number,
      centerY: number,
      points: number,
      outerRadius: number,
      innerRadius: number,
      rotation = 0
    ) => {
      const coords = [];
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points + rotation;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        coords.push(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        );
      }
      return coords;
    };
    // Создаем звезду
    const starPoints = createStarPoints(320, 180, 15, 100, 50);
    const starShape = new PIXI.Polygon(starPoints);

    const star = new PIXI.Graphics();
    star.lineStyle(4, 0xff0000, 1);
    star.beginFill(0xffcc00);
    star.drawShape(starShape);
    star.endFill();

    mainContainer.addChild(star);

    return mainContainer;
  })()
);

export { containers };
