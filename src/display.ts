export class Display {
  private elm = document.createElement("div");
  private count: number = 0;
  constructor() {}

  /**
   * init
   */
  public init(): boolean {
    console.log("Display init!");
    let base = document.getElementById("secondary");
    // secondaryのDOMがなければreturn
    if (!base) {
      return false;
    }
    base.innerHTML = "";

    // 表示領域作成
    this.elm.setAttribute("id", "subtitle-screen");
    // 表示領域 の見栄え属性をセット
    this.elm.setAttribute("frameBorder", "1");
    this.elm.setAttribute("scrolling", "no");

    // 表示領域 の配置属性をセット
    this.elm.style.backgroundColor = "#bfbfbf";
    this.elm.style.position = "relative";
    this.elm.style.width = "500px";
    this.elm.style.height = "500px";

    // 表示領域 の内容をセット
    this.elm.innerText = "Hello, worldaaa";

    // 表示領域 を実装
    base.appendChild(this.elm);

    return true;
  }

  /**
   * setSubtitle
   */
  public setSubtitle(subtitle: any) {
    // console.log(subtitle);
    // for (let i in subtitle) {
    //   let element = document.getElementById("subtitle-screen");
    //   if (element && this.count < 100) {
    //     element.insertAdjacentHTML("afterbegin", `<p>${i}</p>`);
    //     console.log("add");
    //     this.count++;
    //   }
    // }
  }
}
