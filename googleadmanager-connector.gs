/// GLOBAL VARIABLES /////
var PRIVATE_KEY='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var CLIENT_EMAIL='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var USER_EMAIL='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var ARR_VALUE =[
'monthYear',
'date',
'lineItemName',
'lineItemType',
'orderName',
'advertiserName',
'adNetworkName',
'creativeName',
'creativeBillingType',
'creativeSize',
'adSlotName1',
'placementName',
'targeting',
'deviceCategoryName',
'countryName',
'regionName',
'topLevel#12015327#value',
'demandChannelName',
'unifiedPricingRuleName',
'totalReservationImpressionsDelivered',
'totalReservationClicksDelivered',
'totalReservationCtrDelivered',
'totalReservationPubCostDelivered',
'totalReservationPubCostWithCpdDelivered',
'totalReservationEcpmDelivered',
'totalCodeServes',
'XFP_TOTAL_QUERIES_FOR_INVENTORY_DIMENSIONS',
'XFP_TOTAL_MATCHED_QUERIES_FOR_INVENTORY_DIMENSIONS',
'XFP_TOTAL_UNMATCHED_QUERIES_FOR_INVENTORY_DIMENSIONS',
'XFP_TOTAL_FILL_RATE_FOR_INVENTORY_DIMENSIONS',
'totalUnmatchedQueries',
'activeViewViewableImpressions',
'activeViewViewableImpressionsRate',
'activeViewEligibleImpressions',
'activeViewMeasurableImpressions',
'measurableImpressionsRate',
'XFP_ACTIVE_VIEW_TOTAL_AVERAGE_VIEWABLE_TIME',
'XFP_ACTIVE_VIEW_TOTAL_VCPM'];
///STEP.1: AUTHENTICATION////
///Define an authentication type for GAM API ////
/// Using OAUTH2 for authentication//////
function getAuthType(){
  var cc =DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.OAUTH2).build();
}
///1.2.Reset Authentication////
function resetAuth() {
  getOAuthService().reset();
}
///1.2.Validation Authentication////
function isAuthValid() {
  return getOAuthService().hasAccess();
}

///1.1.Create OAhth Service through Google Clients API/////
function getOAuthService() {
  return OAuth2.createService('AdManager')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    // Set the private key and issuer.
    .setPrivateKey(PRIVATE_KEY)
    .setClientId('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    .setClientSecret('xxxxxxxxxxxxxxxxxxx')
    .setIssuer(CLIENT_EMAIL)
    .setSubject(USER_EMAIL)
    .setScope('https://www.googleapis.com/auth/dfp')  
    .setCallbackFunction('authCallback')
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties())
    .setPropertyStore(PropertiesService.getScriptProperties())    
    .setCache(CacheService.getUserCache())
    .setParam('login_hint', Session.getEffectiveUser().getEmail())
    .setParam('access_type', 'offline')
    .setParam('prompt', 'consent');
};
function isAdminUser() {
  return true;
}
function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return true;
  } else {
    return false;
  };
};

function get3PAuthorizationUrls() {
  return getOAuthService().getAuthorizationUrl();
}
///STEP.2: CONFIG FOR CONNECTOR. This step is after the authentication step is successfully
function getConfig(){
  var cf= DataStudioApp.createCommunityConnector();
  var config =cf.getConfig();
  if(isAuthValid()){
    var networkCode = getAdNetWork();
    if(networkCode.length>0){
      for(var i=0; i<networkCode.length;i++){
        config
        .newSelectSingle()
        .setId("adNetworkCode")
        .setName("Select Ad NetWork Code")
        .addOption(config.newOptionBuilder().setLabel(networkCode[i]).setValue(networkCode[i]));
      }
    }
  }
  config.setDateRangeRequired(true);
  config.setIsSteppedConfig(false);
  return config.build();
}

/// Fetching the ad network from GAM API
function getAdNetWork(){
  var service = getOAuthService();
  var adNetworkCode = [];
  var soapRequest='<?xml version="1.0" encoding="UTF-8"?>'
+'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
+'<soapenv:Header>'
+'<ns1:RequestHeader soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="https://www.google.com/apis/ads/publisher/v202108">'
+'<ns1:applicationName>Google Ad Manager API</ns1:applicationName>'
+'</ns1:RequestHeader>'
+'</soapenv:Header>'
+'<soapenv:Body>'
+'<getAllNetworks xmlns="https://www.google.com/apis/ads/publisher/v202108"></getAllNetworks>'
+'</soapenv:Body>'
+'</soapenv:Envelope>';
  var options ={
    "method":"GET",
    "contentType" : "application/soap+xml",
    "payload" : soapRequest,
    'headers' : {Authorization: 'Bearer ' + service.getAccessToken()},
  };
 var fetchAdNetworks = UrlFetchApp.fetch("https://ads.google.com/apis/ads/publisher/v202108/NetworkService?wsdl",options).getContentText();
 var document = XmlService.parse(fetchAdNetworks);
  Logger.log("Document : " + document);
 var allElements = document.getRootElement().getChildren();
  Logger.log("All Element : " + allElements);
  var responseElement = allElements[1].getChildren(); 
  Logger.log("Element : "+ responseElement[0].getAllContent());
  var rval = responseElement[0].getAllContent();
  //var allAdNetworks = rval.getChildren();
  var vralElements = rval[0].asElement().getChildren();
  for(var i=0;i < vralElements.length;i++){
     Logger.log("Vral Element : "+ vralElements[i]);
    if(vralElements[i].getName()==="networkCode"){
     adNetworkCode.push(vralElements[i].getValue());
      Logger.log("Ad Network Code : "+ vralElements[i].getValue());
    }
  }
 return adNetworkCode;
}
/// STEP.3 Displaying the fields of connector
function getFields(){ 
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  fields.newDimension().setId("MONTH_AND_YEAR").setName("Month and year").setType(types.YEAR_MONTH);
  fields.newDimension().setId("DATE").setName("Date").setType(types.YEAR_MONTH_DAY);
  fields.newDimension().setId("LINE_ITEM_NAME").setName("Line item").setType(types.TEXT);
  fields.newDimension().setId("LINE_ITEM_TYPE").setName("Line item type").setType(types.TEXT);
  fields.newDimension().setId("ORDER_NAME").setName("Order").setType(types.TEXT);
  fields.newDimension().setId("ADVERTISER_NAME").setName("Advertiser").setType(types.TEXT);
  fields.newDimension().setId("AD_NETWORK_NAME").setName("Ad network name").setType(types.TEXT);
  fields.newDimension().setId("CREATIVE_NAME").setName("Creative").setType(types.TEXT);
  fields.newDimension().setId("CREATIVE_BILLING_TYPE").setName("Creative billing type").setType(types.TEXT);
  fields.newDimension().setId("CREATIVE_SIZE").setName("Creative size").setType(types.TEXT);
  fields.newDimension().setId("AD_UNIT_NAME").setName("Ad unit").setType(types.TEXT);
  fields.newDimension().setId("PLACEMENT_NAME").setName("Placement").setType(types.TEXT);
  fields.newDimension().setId("TARGETING").setName("Targeting").setType(types.TEXT);
  fields.newDimension().setId("DEVICE_CATEGORY_NAME").setName("Device category").setType(types.TEXT);
  fields.newDimension().setId("COUNTRY_NAME").setName("Country").setType(types.TEXT);
  fields.newDimension().setId("REGION_NAME").setName("Region").setType(types.TEXT);
  fields.newDimension().setId("CUSTOM_DIMENSION").setName("Projects").setType(types.TEXT);
  fields.newDimension().setId("DEMAND_CHANNEL_NAME").setName("Demand channel").setType(types.TEXT);
  fields.newDimension().setId("UNIFIED_PRICING_RULE_NAME").setName("Unified pricing rule").setType(types.TEXT);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_IMPRESSIONS").setName("Total impressions").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_TARGETED_IMPRESSIONS").setName("Total targeted impressions").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_CLICKS").setName("Total clicks").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_TARGETED_CLICKS").setName("Total targeted clicks").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_CTR").setName("Total CTR").setType(types.NUMBER).setAggregation(aggregations.AVG);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_CPM_AND_CPC_REVENUE").setName("Total CPM and CPC revenue").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_ALL_REVENUE").setName("Total CPM, CPC, CPD, and vCPM revenue").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_LINE_ITEM_LEVEL_WITHOUT_CPD_AVERAGE_ECPM").setName("Total average eCPM").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_CODE_SERVED_COUNT").setName("Total code served count").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_AD_REQUESTS").setName("Total ad requests").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_RESPONSES_SERVED").setName("Total responses served").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_UNMATCHED_AD_REQUESTS").setName("Total unmatched ad requests").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_FILL_RATE").setName("Total fill rate").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_INVENTORY_LEVEL_UNFILLED_IMPRESSIONS").setName("Unfilled impressions").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_VIEWABLE_IMPRESSIONS").setName("Total Active View viewable impressions").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_VIEWABLE_IMPRESSIONS_RATE").setName("Total Active View % viewable impressions'").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_ELIGIBLE_IMPRESSIONS").setName("Total Active View eligible impressions").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_MEASURABLE_IMPRESSIONS").setName("Total Active View measurable impressions").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_MEASURABLE_IMPRESSIONS_RATE").setName("Total Active View % measurable impressions").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_AVERAGE_VIEWABLE_TIME").setName("Total Active View Average Viewable Time (seconds)").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_ACTIVE_VIEW_REVENUE").setName("Total Active View Revenue").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.setDefaultDimension("DATE");
  fields.setDefaultMetric("TOTAL_LINE_ITEM_LEVEL_CPM_AND_CPC_REVENUE");
  return fields;
}
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  return cc.newGetSchemaResponse().setFields(getFields()).build();
}
function getFormatData(requestedFields, isCheck){
  var result=[];
  if(isCheck=="metric"){
    result=(requestedFields.asArray().map(function(field){
    if(field.isMetric()){
      return field.getId(); 
    }
   })).filter(function(e){return e !==undefined});
  }
  if(isCheck=="dimension"){
    result = (requestedFields.asArray().map(function(field){
    if(field.isDimension()){
      return field.getId(); 
    }
   })).filter(function(e){return e !==undefined});
  }
  return result;  
}
/// STEP.4 Fetching Data
function getData(request){
  var dimension =[];
  var metric =[];
  var values ={};
  var cache = CacheService.getScriptCache();
  var strCache='';
  var requestedData =[];
  var returnScript={};
  // Create schema for requested fields
  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );
  dimension = getFormatData(requestedFields,"dimension");
  metric = getFormatData(requestedFields,"metric");
  ////// Defining Date Range/////////
  var startDate="";
  var endDate="";
  if(request.dateRange.startDate!=""){
    startDate= request.dateRange.startDate;
  }
  if(request.dateRange.endDate!=""){
    endDate= request.dateRange.endDate;
  }
  Logger.log("Dimensions : " + dimension.toString());
  Logger.log("Metrics : " + metric.toString());
  if(dimension.toString()==""){
    dimension =['DATE'];
  }
  var arrRequestedFields = requestedFields.asArray();
  arrRequestedFields.forEach(function(field){
    strCache+=field.getId();
  });
  //strCache+="-"+startDate+"-"+endDate;
  //Logger.log("get cache of "+ "dl-"+strCache+":" + cache.get("dl-"+strCache+startDate));
  var cached = null;//JSON.parse(cache.get("dl-"+strCache+startDate));
  //Logger.log("cached : " + JSON.stringify(cached));
  if(cached==null || (typeof cached.rows ==="undefined")){
    Logger.log("Take the report without cache");
  ////// Requesting Report//////////
  var report=requestReport(startDate,endDate,dimension,metric,request.configParams.adNetworkCode);
  if(report.length>0){
  //// Parse Report to values
  requestedData=report.map(function(row){
    if(JSON.stringify(row)!=""){
    var arrValues =[];
    arrRequestedFields.forEach(function(field){
      var fieldID = field.getId();
      //Logger.log("field ID requested: " + fieldID);
      switch(fieldID){
        case 'MONTH_AND_YEAR' :
          arrValues.push(row.monthYear);
          break;
         case 'DATE' :
          if(typeof row.date !== 'undefined'){
            var strDate = row.date;
            var arrDate = strDate.split('/');
            var date = new Date(strDate);
            //Logger.log("Date: "+ '20'+ arrDate[2] + arrDate[0] + arrDate[1]12/26/20 + date);
            arrValues.push(Utilities.formatDate(date, Session.getTimeZone(), 'yyyyMMdd'));
          }else{
            arrValues.push(row.date);
          }
          break;
         case 'LINE_ITEM_NAME' :
          arrValues.push(row.lineItemName);
          break;
         case 'LINE_ITEM_TYPE' :
          arrValues.push(row.lineItemType);
          break;
         case 'ORDER_NAME' :
          arrValues.push(row.orderName);
          break;
         case 'ADVERTISER_NAME' :
          arrValues.push(row.advertiserName);
          break;
         case 'AD_NETWORK_NAME' :
          arrValues.push(row.adNetworkName);
          break;
         case 'CREATIVE_NAME' :
          arrValues.push(row.creativeName);
          break;
         case 'CREATIVE_BILLING_TYPE' :
          arrValues.push(row.creativeBillingType);
          break;
         case 'CREATIVE_SIZE' :
          arrValues.push(row.creativeSize);
          break;
         case 'AD_UNIT_NAME' :
          if(typeof row.adSlotName1!=="undefined"){
            arrValues.push(row.adSlotName1);
          }
          break;
         case 'PLACEMENT_NAME' :
          arrValues.push(row.placementName);
          break;
         case 'TARGETING' :
          arrValues.push(row.targeting);
          break;
         case 'DEVICE_CATEGORY_NAME' :
          arrValues.push(row.deviceCategoryName);
          break;
         case 'COUNTRY_NAME' :
          arrValues.push(row.countryName);
          break;
         case 'REGION_NAME' :
          arrValues.push(row.regionName);
          break;
         case 'CUSTOM_DIMENSION' :
          //var str = 'topLevel#12015327#value';
          //Logger.log("test custom dimension : "+row["topLevel#12015327#value"]);
          arrValues.push(row["topLevel#12015327#value"]);
          break;
         case 'DEMAND_CHANNEL_NAME' :
          arrValues.push(row.demandChannelName);
          break;
         case 'UNIFIED_PRICING_RULE_NAME' :
          arrValues.push(row.unifiedPricingRuleName);
          break;
         case 'TOTAL_LINE_ITEM_LEVEL_IMPRESSIONS' :
          if(typeof row.totalReservationImpressionsDelivered!=='undefined'){
            var impressions = (row.totalReservationImpressionsDelivered).split(",").join("");
            arrValues.push(parseFloat(impressions));
          }else{
            arrValues.push(row.totalReservationImpressionsDelivered);
          }
          //arrValues.push(parseInt((row.totalReservationImpressionsDelivered).replace(",","")));
          break;
         case 'TOTAL_LINE_ITEM_LEVEL_CLICKS' :
          if(typeof row.totalReservationClicksDelivered!=='undefined'){
            var clicks = (row.totalReservationClicksDelivered).split(",").join("");
            arrValues.push(parseFloat(clicks));
          }else{
            arrValues.push(row.totalReservationClicksDelivered);
          }
          //arrValues.push(row.totalReservationClicksDelivered);
          break;
         case 'TOTAL_LINE_ITEM_LEVEL_CTR' :
          if(typeof row.totalReservationCtrDelivered !=='undefined'){
            var CTR = (row.totalReservationCtrDelivered).replace("%","");
            //Logger.log("eCPM : " + eCPM );
            arrValues.push(parseFloat(CTR/100));
          }else{
             arrValues.push(row.totalReservationCtrDelivered);
          }
          //arrValues.push(row.totalReservationCtrDelivered);
          break;
         case 'TOTAL_LINE_ITEM_LEVEL_CPM_AND_CPC_REVENUE' :
          if(typeof row.totalReservationPubCostDelivered !=='undefined'){
            var revenue = ((row.totalReservationPubCostDelivered).replace("€","")).split(",").join("");
            arrValues.push(parseFloat(revenue));
          }else{
            arrValues.push(row.totalReservationPubCostDelivered);
          }
          break;
         case 'TOTAL_LINE_ITEM_LEVEL_ALL_REVENUE' :
          arrValues.push(row.totalReservationPubCostWithCpdDelivered);
          break;;
         case 'TOTAL_LINE_ITEM_LEVEL_WITHOUT_CPD_AVERAGE_ECPM' :
          if(typeof row.totalReservationEcpmDelivered !=='undefined'){
            var eCPM = (row.totalReservationEcpmDelivered).replace("€","");
            //Logger.log("eCPM : " + eCPM );
            arrValues.push(parseFloat(eCPM));
          }else{
             arrValues.push(row.totalReservationEcpmDelivered);
          }
          break;
         case 'TOTAL_CODE_SERVED_COUNT' :
          arrValues.push(row.totalCodeServes);
          break;
         case 'TOTAL_AD_REQUESTS' :
          if(typeof row.XFP_TOTAL_QUERIES_FOR_INVENTORY_DIMENSIONS!=='undefined'){
            var adRequests = (row.XFP_TOTAL_QUERIES_FOR_INVENTORY_DIMENSIONS).split(",").join("");
            arrValues.push(parseFloat(adRequests));
          }else{
            arrValues.push(row.XFP_TOTAL_QUERIES_FOR_INVENTORY_DIMENSIONS);
          }
          //arrValues.push(row.XFP_TOTAL_QUERIES_FOR_INVENTORY_DIMENSIONS);
          break;
         case 'TOTAL_RESPONSES_SERVED' :
          arrValues.push(row.XFP_TOTAL_MATCHED_QUERIES_FOR_INVENTORY_DIMENSIONS);
          break;
         case 'TOTAL_UNMATCHED_AD_REQUESTS' :
          arrValues.push(row.XFP_TOTAL_UNMATCHED_QUERIES_FOR_INVENTORY_DIMENSIONS);
          break;
         case 'TOTAL_FILL_RATE' :
          if(typeof row.XFP_TOTAL_FILL_RATE_FOR_INVENTORY_DIMENSIONS !=='undefined'){
            var fillRate = (row.XFP_TOTAL_FILL_RATE_FOR_INVENTORY_DIMENSIONS).replace("%","");
            //Logger.log("eCPM : " + eCPM );
            arrValues.push(parseFloat(fillRate/100));
          }else{
             arrValues.push(row.XFP_TOTAL_FILL_RATE_FOR_INVENTORY_DIMENSIONS);
          }
          //values.push(row.XFP_TOTAL_FILL_RATE_FOR_INVENTORY_DIMENSIONS);
          break;
         case 'TOTAL_INVENTORY_LEVEL_UNFILLED_IMPRESSIONS' :
          if(typeof row.totalUnmatchedQueries !=='undefined'){
            var unfilledImpressions = (row.totalUnmatchedQueries).split(",").join("");
            //Logger.log("eCPM : " + eCPM );
            arrValues.push(parseFloat(unfilledImpressions));
          }else{
             arrValues.push(row.totalUnmatchedQueries);
          }
          //arrValues.push(row.totalUnmatchedQueries);
          break;
         case 'TOTAL_ACTIVE_VIEW_VIEWABLE_IMPRESSIONS' :
          arrValues.push(row.activeViewViewableImpressions);
          break;
         case 'TOTAL_ACTIVE_VIEW_VIEWABLE_IMPRESSIONS_RATE' :
          if(typeof row.activeViewViewableImpressionsRate !=='undefined'){
            var viewableRate = (row.activeViewViewableImpressionsRate).replace("%","");
            //Logger.log("eCPM : " + eCPM );
            if(viewableRate===null){
              viewableRate=0;
            }
            arrValues.push(parseFloat(viewableRate/100));
          }else{
             arrValues.push(row.activeViewViewableImpressionsRate);
          }
          //arrValues.push(row.activeViewViewableImpressionsRate);
          break;
         case 'TOTAL_ACTIVE_VIEW_ELIGIBLE_IMPRESSIONS' :
          arrValues.push(row.activeViewEligibleImpressions);
          break;
         case 'TOTAL_ACTIVE_VIEW_MEASURABLE_IMPRESSIONS' :
          arrValues.push(row.activeViewMeasurableImpressions);
          break;
         case 'TOTAL_ACTIVE_VIEW_MEASURABLE_IMPRESSIONS_RATE' :
          arrValues.push(row.measurableImpressionsRate);
          break;
         case 'TOTAL_ACTIVE_VIEW_AVERAGE_VIEWABLE_TIME' :
          arrValues.push(row.XFP_ACTIVE_VIEW_TOTAL_AVERAGE_VIEWABLE_TIME);
          break;
         case 'TOTAL_ACTIVE_VIEW_REVENUE' :
          arrValues.push(row.XFP_ACTIVE_VIEW_TOTAL_VCPM);
          break;
        default:
          arrValues.push('');
      }
    });
    return {values : arrValues};
  }});
  }
  //Logger.log("Remove the lasted element : " + (requestedData[requestedData.length-1].values)[0]);
  if(requestedData.length>0 && typeof (requestedData[requestedData.length-1].values)[0] === null||typeof (requestedData[requestedData.length-1].values)[0] === 'undefined'){
    //Logger.log("Remove the lasted element : " + requestedData[requestedData.length-1].values);
    requestedData.pop();
  }
  var strKey = "dl-"+ strCache;
  var checkSizeOfString = encodeURI(strValue).split(/%..|./).length - 1;
  Logger.log("Size of the report"+checkSizeOfString);
  returnScript = {schema : requestedFields.build(),rows: requestedData};
  var strValue = JSON.stringify(returnScript);
  /*if(checkSizeOfString <100000 && strKey.length<255){
      cache.put(strKey,strValue, 43200);
  }else{
      Logger.log("Size of string is not cached :" +checkSizeOfString);
  } */ 
}else{
    returnScript = cached;
    Logger.log("Take the Report from the cache");
  }
  //Logger.log("Return Studio Request : " + JSON.stringify(returnScript.rows));
  return returnScript;
}
///Fetching Report from GAM API
function requestReport(startDate,endDate,dimension,metric,adNetworkCode){
  var report =[];
  var reportJobsId='';
  var downloadURL='';
  //// get OAuth Service for authenticating ////////
  var service = getOAuthService();
  var access_token = service.getAccessToken();
  //// Testing parameters //////
  /*adNetworkCode = '29838709';
  dimension =['DATE'];
  metric =['TOTAL_LINE_ITEM_LEVEL_CPM_AND_CPC_REVENUE'];
  startDate='2020-12-14';
  endDate ='2020-12-15';*/0000000000
  var strDimension ='';
  var strColumn = '';
  var strCustomDimension ='';
  var cacheStr ='';
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  var timezone = Session.getTimeZone();
  if(typeof startDate==="undefined"){
    startDate = Utilities.formatDate(oneWeekAgo, timezone, 'yyyy-MM-dd');
  }
  if(typeof endDate==="undefined"){
   endDate = Utilities.formatDate(today, timezone, 'yyyy-MM-dd');
  }
  var arrStartDate = startDate.split("-");
  var arrEndDate = endDate.split("-");
  for(var i=0;i<dimension.length;i++){
    if(dimension[i]=='CUSTOM_DIMENSION'){
      strCustomDimension = '<customDimensionKeyIds>12015327</customDimensionKeyIds>';
    }
    strDimension+='<dimensions>'+dimension[i]+'</dimensions>';
    cacheStr+=dimension[i];
  }
  for(var j=0;j<metric.length;j++){
    strColumn+='<columns>'+metric[j]+'</columns>';
    cacheStr+=metric[j];
  }
  //// RUN A REPORT JOB //////
  var soapRunReportJob ='<?xml version="1.0" encoding="UTF-8"?>'
+'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
+'<soapenv:Header>'
+'<ns1:RequestHeader soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="https://www.google.com/apis/ads/publisher/v202108">'
+'<ns1:networkCode>'+adNetworkCode+'</ns1:networkCode>'
+'<ns1:applicationName>Google Ad Manager API</ns1:applicationName>'
+'</ns1:RequestHeader>'
+'</soapenv:Header>'
+'<soapenv:Body>'
+'<runReportJob xmlns="https://www.google.com/apis/ads/publisher/v202108">'
+'<reportJob>'
+'<reportQuery>'
+strDimension
+'<adUnitView>HIERARCHICAL</adUnitView>'
+strColumn
+strCustomDimension
+'<startDate>'
+'<year>'+arrStartDate[0]+'</year>'
+'<month>'+arrStartDate[1]+'</month>'
+'<day>'+arrStartDate[2]+'</day>'
+'</startDate>'
+'<endDate>'
+'<year>'+arrEndDate[0]+'</year>'
+'<month>'+arrEndDate[1]+'</month>'
+'<day>'+arrEndDate[2]+'</day>'
+'</endDate>'
+'<dateRangeType>CUSTOM_DATE</dateRangeType>'
+'<timeZoneType>PUBLISHER</timeZoneType>'
+'</reportQuery>'
+'</reportJob>'
+'</runReportJob>'
+'</soapenv:Body>'
+'</soapenv:Envelope>';
  var options1 ={
    "method":"GET",
    "contentType" : "application/soap+xml",
    "payload" : soapRunReportJob,
    "headers" : {Authorization: 'Bearer ' + access_token},
    "muteHttpExceptions": true
  };
 var fetchReportQuery = UrlFetchApp.fetch("https://ads.google.com/apis/ads/publisher/v202108/ReportService?wsdl",options1).getContentText();
 var document1 = XmlService.parse(fetchReportQuery);
 var allElements = document1.getRootElement().getChildren();
 var responseElement = allElements[1].getChildren(); 
 var rval1 = responseElement[0].getAllContent();
 var reportJobs = rval1[0].asElement().getChildren();
 reportJobs.forEach(function (element){
    if(element.getName()==="id"){
      reportJobsId = element.getValue();
    }
  });
//Logger.log("reportJobsId : " + reportJobsId);
//// CHECK REPORT JOB STATUS//////
  var getReportJobStatus = '<?xml version="1.0" encoding="UTF-8"?>'
+'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
+'<soapenv:Header>'
+'<ns1:RequestHeader soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="https://www.google.com/apis/ads/publisher/v202108">'
+'<ns1:networkCode>'+adNetworkCode+'</ns1:networkCode>'
+'<ns1:applicationName>Ludigames GAM API</ns1:applicationName>'
+'</ns1:RequestHeader>'
+'</soapenv:Header>'
+'<soapenv:Body>'
+'<getReportJobStatus xmlns="https://www.google.com/apis/ads/publisher/v202108">'
+'<reportJobId>'+reportJobsId+'</reportJobId>'
+'</getReportJobStatus>'
+'</soapenv:Body>'
+'</soapenv:Envelope>';
  var options2 ={
    "method":"GET",
    "contentType" : "application/soap+xml",
    "payload" : getReportJobStatus,
    "headers" : {Authorization: 'Bearer ' + access_token},
    "muteHttpExceptions": true
  };
 var fetchReportJobStatus = UrlFetchApp.fetch("https://ads.google.com/apis/ads/publisher/v202108/ReportService?wsdl",options2).getContentText();
 var document2 = XmlService.parse(fetchReportJobStatus);
//  Logger.log("document2 : " + document2);
 var allElementsReportJobsStatus = document2.getRootElement().getChildren();
 var responseElementReportJobsStatus = allElementsReportJobsStatus[1].getChildren(); 
 var rval2 = responseElementReportJobsStatus[0].getAllContent();
 //Logger.log("responseElementReportJobsStatus : " + rval2[0].getValue());
//// IF REPORT JOB STATUS IS COMPLETED/FAILED TO DOWNLOAD A REPORT ///////
 if(rval2[0].getValue()==='COMPLETED'){
   report = donwloadReportJobs(adNetworkCode, reportJobsId, access_token);
 }else{
   Utilities.sleep(15000);
   Logger.log("sleep to take report");
   report = donwloadReportJobs(adNetworkCode, reportJobsId, access_token);
 }
 return report;
}
function donwloadReportJobs(adNetworkCode, reportJobID, access_token){
  //var cache = CacheService.getScriptCache();
  //var cached = cache.get("downloaded-"+cacheStr);
  /*var sleeptime = 15000;
  if(typeof cached !=="undefined"|| typeof cached !==null){
    sleeptime =3000;
  }*/
  var downloadURL='';
  var report=[];
  var soapGetReportDownloadURL ='<?xml version="1.0" encoding="UTF-8"?>'
+'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
+'<soapenv:Header>'
+'<ns1:RequestHeader soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="0" xmlns:ns1="https://www.google.com/apis/ads/publisher/v202108">'
+'<ns1:networkCode>'+adNetworkCode+'</ns1:networkCode>'
+'<ns1:applicationName>Google Ad Manager API</ns1:applicationName>'
+'</ns1:RequestHeader>'
+'</soapenv:Header>'
+'<soapenv:Body>'
+'<getReportDownloadUrlWithOptions xmlns="https://www.google.com/apis/ads/publisher/v202108">'
+'<reportJobId>'+reportJobID+'</reportJobId>'
+'<reportDownloadOptions>'
+'<exportFormat>XML</exportFormat>'
+'<useGzipCompression>false</useGzipCompression>'
+'</reportDownloadOptions>'
+'</getReportDownloadUrlWithOptions>'
+'</soapenv:Body>'
+'</soapenv:Envelope>';
  var options ={
    "method":"GET",
    "contentType" : "application/soap+xml",
    "payload" : soapGetReportDownloadURL,
    "headers" : {Authorization: 'Bearer ' + access_token},
    "muteHttpExceptions": true
  };
  //if(cached ==null || cached =="none"){
   var fetchDownloadURL = UrlFetchApp.fetch("https://ads.google.com/apis/ads/publisher/v202108/ReportService?wsdl",options).getContentText();
   var document = XmlService.parse(fetchDownloadURL);
   var allElementsDownloadURL = document.getRootElement().getChildren();
   var responseElementDownloadURL = allElementsDownloadURL[1].getChildren(); 
   var rval = responseElementDownloadURL[0].getAllContent();
   downloadURL=rval[0].getValue();
   //Logger.log("responseElementDownloadURL : " + responseElementDownloadURL.toString());
   //Logger.log("downloadURL : " + downloadURL);
   ///// Take the XML report by using the download URL
  if(downloadURL.length>0){
   var xmlReport = UrlFetchApp.fetch(downloadURL).getContentText();
   var documentReport = XmlService.parse(xmlReport);
   var rootReport = documentReport.getRootElement();
   //Logger.log("rootReport : " + rootReport);
   var getDataSet = rootReport.getChildren();
   getDataSet.forEach(function (e){
     if (e.getName()==="ReportData"){
       var eChildrens = e.getChildren();
       eChildrens.forEach(function(eChildren){
         //Logger.log("eChildren : " + eChildren.getName());
         if(eChildren.getName()==="DataSet"){
           var rows= eChildren.getChildren();
           rows.forEach(function(row){
             var rowValues ={};
             if(row.getName()==="Row"){
               var rowChild = row.getChildren();
               rowChild.forEach(function(column){
                 var value = column.getChild("Val").getValue();
                 var colAttribute =column.getAttributes();
                 var check = findArrayValue(colAttribute[0].getValue());
                 if(check == true){
                   rowValues[colAttribute[0].getValue()]=value;
                 }
               });
             }
             report.push(rowValues)
           });
         }
       });
     }
   });
  }
  //cache.put("downloaded"+cacheStr,report, 15000);
  //}else{
 // report = cached;
  //}
 return report;
}
function findArrayValue(val){
  var check = false;
  for(var i=0;i<ARR_VALUE.length;i++){
    if(ARR_VALUE[i]==val){
      check = true;
      break;
    }
  }
  return check;
}
