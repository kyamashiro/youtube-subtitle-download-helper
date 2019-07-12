export class Item {
    constructor(private name: string, private price: number) { }

    public say(elem: HTMLElement | null): void {
        if (elem) { // 引数がnullでない場合
            elem.innerHTML = '書名：' + this.name + '  価格: ' + this.price + '円';
        }
    }
}