//META CONFIGURATIONS
var url = "https://s3.amazonaws.com/data-production-walltime-info/production/dynamic/";
var suffixMeta = "meta.json";
var page_p = "_p";
var page_n = "0";
var page_s = ".json";
var totalBTC = new Big(0); 
var totalBRL = new Big(0);
// END OF META CONFIGURATIONS


//HOW MANY BTCS TO CALCULATE?
var qntCompra = 1;
// -----------Type It configurations--------------//
function getText(){
	$('#Text').typeIt({
    	speed: 50,
     	autoStart: false
	})
	.tiType('Wll')
	.tiPause(200)
	.tiDelete(2)
	.tiType('ell, ')
	.tiPause(1000)
	.tiType('how much does a Bitcoin costs?')
	.tiBreak() .tiPause(220)
	.tiType(' I\'ll check that for you')
	.tiSettings({speed: 700})
	.tiType('...')
	.tiPause(0)
	.tiSettings({speed: 50})
	.tiDelete()
	.tiType( 'R$' + parseFloat(totalBRL).toPrecision(6) + ', how about that?');
}

//--------End of TypeIt, Start of the Task--------//
$.ajaxSetup({
	crossOrigin: true
});

function getMeta(){
$.getJSON(url + suffixMeta, null, function(data) {
	callOrderBook(data);
});
}

function callOrderBook(data){
	obj = JSON.parse(data);
	var suffixRound = obj.order_book_prefix + "_r" + obj.current_round + page_p + page_n + page_s;
	$.getJSON(url + suffixRound, null, function(data){
		parseOrderBook(data);
	});
}

function parseOrderBook(data){
	var obj = JSON.parse(data);
	var market = "xbt-brl";
	calculateBitcoin(obj[market]);
}

function calculateBitcoin(book){
	for (var i = 0; totalBTC != qntCompra && i < book.length - 1; i++){
		if (book[i][0].indexOf('/') > - 1) {
			var values_btc = book[i][0].split('/');
			var qntdBTC_ord = new Big(Big(values_btc[0]).div(Big(values_btc[1])));
		}
		else {
			var qntdBTC_ord = new Big(book[i][0]);
		}

		if (book[i][1].indexOf('/') > - 1){
			var values_brl = book[i][1].split('/');
			var qntdBRL_ord = new Big(Big(values_brl[0]).div(Big(values_brl[1])));
		}
		else {
			var qntdBRL_ord = new Big(book[i][1]);
		}

		if ( (qntCompra) - (qntdBTC_ord.plus(totalBTC)) < 0){

			var valor = new Big((qntdBRL_ord*(qntCompra-totalBTC))/qntdBTC_ord);
			totalBRL = totalBRL.plus(valor);
			totalBTC = Big(qntCompra);
		}

		else {
			totalBRL = totalBRL.plus(qntdBRL_ord);
			totalBTC = totalBTC.plus(qntdBTC_ord);
		}
	}

	if ( totalBTC < qntCompra){
		page_n = (Number(page_n)+1).toString();
		getMeta();
	}

	getText();
}
