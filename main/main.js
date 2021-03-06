const loadAllItems = require('./datbase')
const loadPromotions = require('./datbase1')
module.exports = function printInventory(inputs) {
    let ItemJson=GetInput(inputs);
    let CostJson=CalcCost(ItemJson);
    let ResultString=PrintResult(ItemJson,CostJson);
    console.log(ResultString);
    return 'Hello World!';
};

function GetInput(inputArray){
    let itemJson=[];
    let ItemInfo=loadAllItems();
    let insideFlag=0;
    for(let index in inputArray)
    {
        let itemBarcode='';
        let itemNum=0;
        if(inputArray[index].indexOf('-')!==-1)   //对称重商品进行barcode与num提取
        {
            itemBarcode=inputArray[index].split('-')[0];
            itemNum=parseInt(inputArray[index].split('-')[1]);
        }
        else
        {
            itemBarcode=inputArray[index];
            itemNum=1;
        }
        //若当前barcode信息已近记录在输出结果中，对相应商品数量增加
        itemJson.forEach(item=>{
            if(item.barcode==itemBarcode){ item.num+=itemNum;insideFlag=1;}
        })

        if(insideFlag==1)
        {   insideFlag=0;}
        else    //若当前barcode信息未记录在输出结果中，则增加商品信息
        {
            for(let i in ItemInfo)
            {
                if (ItemInfo[i].barcode==itemBarcode)
                {
                    let addItem = {};
                    addItem.barcode=ItemInfo[i].barcode;
                    addItem.name=ItemInfo[i].name;
                    addItem.unit=ItemInfo[i].unit;
                    addItem.num=itemNum;
                    addItem.price=ItemInfo[i].price;
                    addItem.total=0;
                    itemJson.push(addItem);
                    break;
                }
            }

        }
    }
    return itemJson;
}

function CalcCost(itemJson){
    let Promotion=loadPromotions();
    let PromotionItem=Promotion[0].barcodes;
    let costJson=[];

    for(let i in itemJson)
    {
        if(PromotionItem.indexOf(itemJson[i].barcode)>=0)  //判断购买商品是否属于折扣商品
        {
            let discountNum=Math.floor(itemJson[i].num/3);  //计算折扣数量
            if(discountNum>0)
            {
                itemJson[i].total=(itemJson[i].num-discountNum)*itemJson[i].price;   //计算每项购买商品的小计信息，记录赠送的商品信息
                let costItem = {};
                costItem.name=itemJson[i].name;
                costItem.price=itemJson[i].price;;
                costItem.unit=itemJson[i].unit;
                costItem.num=discountNum;
                costJson.push(costItem);
            }
        }
        else
        {   itemJson[i].total=itemJson[i].num*itemJson[i].price;}
    }
    return costJson;
}

function PrintResult(itemJson,costJson){

    let resultString='';
    let allCost=0;
    let discountCost=0;
    resultString+='***<没钱赚商店>购物清单***\n';
    for(let i in itemJson)
    {
        allCost+=itemJson[i].total;
        let Str='名称：'+itemJson[i].name+'，数量：'+itemJson[i].num+itemJson[i].unit+'，单价：'+itemJson[i].price.toFixed(2)+'(元)，小计：'+itemJson[i].total.toFixed(2)+'(元)\n';
        resultString+=Str;
    }
    resultString+='----------------------\n';
    if(costJson.length!=0)
    {
        resultString+='挥泪赠送商品：\n';
        for (let j in costJson)
        {

            discountCost+=costJson[j].num*costJson[j].price;
            let Str2='名称：'+costJson[j].name+'，数量：'+costJson[j].num+costJson[j].unit+'\n';
            resultString+=Str2;
        }
        resultString+='----------------------\n';
    }


    resultString+='总计：'+allCost.toFixed(2)+'(元)\n';
    resultString+='节省：'+discountCost.toFixed(2)+'(元)\n';
    resultString+='**********************';
    return resultString;
}