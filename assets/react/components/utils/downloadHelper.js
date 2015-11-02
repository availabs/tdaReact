/*globals $,document,navigator,console,module*/
var downloadFile = function(type,output,filename,elem){
  var csvContent = type+output;
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");

  if(link.download !== undefined){
    console.log('download');
    link.setAttribute("href", type+output);
    link.setAttribute("download", filename);
    link.setAttribute('target', '_blank');
    link.click();
  }
  else if(navigator.msSaveBlob) { // IE 10+
    var blob = new Blob([output], {
      "type": "text/csv;charset=utf8;"
    });
    navigator.msSaveBlob(blob, filename);
  }
  else{
    console.log('none');
    //var encodedUri = encodeURI(csvContent);
    //window.open(encodedUri);
     $(elem)
          .attr({
          'download': filename,
          'href': encodedUri,
          'target': '_blank'
      });
      $(elem).click();
  }

};
module.exports=downloadFile;