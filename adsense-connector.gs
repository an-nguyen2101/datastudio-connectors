/// DEFINE THE AUTHENTICATION STEPS//////
//// ON THIS STEP, YOU NEED TO CREATE A NEW PROJECT IN GOOGLE CLOUD PLATFORM //////////////
///////// CREATE A CREDENTIAL WITH OAUTH CLIENT ID FOR WEB APPLICATION ///////////////////// 
//////// ADD : https://script.google.com TO Authorized JavaScript origins//////////////////
/////// ADD : https://script.google.com/macros/d/{YOUR APP SCRIPT PROJECT ID}/usercallback TO Authorized redirect URIs////////////////
function getAuthType() {
  var response ={type : 'OAUTH2'};
  return response;
}
function getOAuthService() {
  return OAuth2.createService('adsense')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com')//// FIND IT IN YOUR PROJECT IN GOOGLE CLOUD
    .setClientSecret('XXXXXXXXXXXXXXXXXXXXXXX')////FIND IT IN YOUR PROJECT IN GOOGLE CLOUD
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction('authCallback')
    .setScope('https://www.googleapis.com/auth/adsense')
    .setParam('access_type', 'offline')
    .setParam('approval_prompt', 'force')
    .setParam('login_hint', Session.getActiveUser().getEmail());
};
function isAdminUser(){
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
function isAuthValid() {
  return getOAuthService().hasAccess();
}
///////// DEFINE THE CONFIGURE PAGES BY GETTING THE LIST OF ADSENSE CLIENT ID ////////////
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector()
  var config = cc.getConfig();
  var arrOptions = [];
  var options=[];
  var countOptions=0;
  // Get Google AdSense ID 
  if(isAuthValid()){
    //Logger.log("parsedResponse"+listAdClients());
    if(listAdClients().length>0){
      var parsedResponse=listAdClients();
      //Logger.log("parsedResponse"+arrOptions);
      /*for(var i=0; i < parsedResponse.length;i++){
        arrOptions.push({'label':parsedResponse[i].name, 'value':parsedResponse[i].id});
      }*/
      arrOptions = parsedResponse.map(function(parsedResponse) {
        return {
          label: parsedResponse.name,
          value: parsedResponse.name + ''
        };     
      });
      //Logger.log(arrOptions);
      for(var i=0;i<arrOptions.length;i++){
        options.push(config.newOptionBuilder().setLabel(arrOptions[i].label).setValue(arrOptions[i].value));
        countOptions = countOptions+1;
      } 
      
      switch(countOptions){
        case 1:
          config
          .newSelectSingle()
          .setId('accountSelection')
          .setName('Select AdSense Account')
          .setHelpText('Please select an account...').addOption(options[0]);
          break;
        case 2:
          config
          .newSelectSingle()
          .setId('accountSelection')
          .setName('Select AdSense Account')
          .setHelpText('Please select an account...').addOption(options[0]).addOption(options[1]);
          break;
        case 3:
          config
          .newSelectSingle()
          .setId('accountSelection')
          .setName('Select AdSense Account')
          .setHelpText('Please select an account...').addOption(options[0]).addOption(options[1]).addOption(options[2]);
          break;
       default:
         config
          .newSelectSingle()
          .setId('accountSelection')
          .setName('Select AdSense Account')
          .setHelpText('Please select an account...').addOption(options[0]);
          break;
                                                                                      
      }
      config.setDateRangeRequired(true);
      config.setIsSteppedConfig(false);
    }else{
      Logger.log('No rows returned.');
    }
  }else{
      get3PAuthorizationUrls();
  }
  //console.log("config0"+config.configParams.accountSelection);
  return config.build();
}
///// DEFINE SCHEME FIELDS BASED ON ALL DEMENSIONS AND METRICS OF ADSENSE MANAGEMENT API///////////
function getFields(){ 
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  fields.newDimension().setId("DATE").setName("DATE").setType(types.YEAR_MONTH_DAY);
  fields.newDimension().setId("WEEK").setName("WEEK").setType(types.YEAR_MONTH_DAY);
  fields.newDimension().setId("MONTH").setName("MONTH").setType(types.YEAR_MONTH);
  fields.newDimension().setId("ACCOUNT_NAME").setName("ACCOUNT_NAME").setType(types.TEXT);
  fields.newDimension().setId("AD_CLIENT_ID").setName("AD_CLIENT_ID").setType(types.TEXT);
  fields.newDimension().setId("PRODUCT_NAME").setName("PRODUCT_NAME").setType(types.TEXT);
  fields.newDimension().setId("PRODUCT_CODE").setName("PRODUCT_CODE").setType(types.TEXT);
  fields.newDimension().setId("AD_UNIT_NAME").setName("AD_UNIT_NAME").setType(types.TEXT);
  fields.newDimension().setId("AD_UNIT_ID").setName("AD_UNIT_ID").setType(types.TEXT);
  fields.newDimension().setId("AD_UNIT_SIZE_NAME").setName("AD_UNIT_SIZE_NAME").setType(types.TEXT);
  fields.newDimension().setId("AD_UNIT_SIZE_CODE").setName("AD_UNIT_SIZE_CODE").setType(types.TEXT);
  fields.newDimension().setId("CUSTOM_CHANNEL_NAME").setName("CUSTOM_CHANNEL_NAME").setType(types.TEXT);
  fields.newDimension().setId("CUSTOM_CHANNEL_ID").setName("CUSTOM_CHANNEL_ID").setType(types.TEXT);
  fields.newDimension().setId("OWNED_SITE_DOMAIN_NAME").setName("OWNED_SITE_DOMAIN_NAME").setType(types.TEXT);
  fields.newDimension().setId("OWNED_SITE_ID").setName("OWNED_SITE_ID").setType(types.TEXT);
  fields.newDimension().setId("URL_CHANNEL_NAME").setName("URL_CHANNEL_NAME").setType(types.TEXT);
  fields.newDimension().setId("URL_CHANNEL_ID").setName("URL_CHANNEL_ID").setType(types.TEXT);
  fields.newDimension().setId("BUYER_NETWORK_NAME").setName("BUYER_NETWORK_NAME").setType(types.TEXT);
  fields.newDimension().setId("BUYER_NETWORK_ID").setName("BUYER_NETWORK_ID").setType(types.TEXT);
  fields.newDimension().setId("BID_TYPE_NAME").setName("BID_TYPE_NAME").setType(types.TEXT);
  fields.newDimension().setId("BID_TYPE_CODE").setName("BID_TYPE_CODE").setType(types.TEXT);
  fields.newDimension().setId("CREATIVE_SIZE_NAME").setName("CREATIVE_SIZE_NAME").setType(types.TEXT);
  fields.newDimension().setId("CREATIVE_SIZE_CODE").setName("CREATIVE_SIZE_CODE").setType(types.TEXT);
  fields.newDimension().setId("DOMAIN_NAME").setName("DOMAIN_NAME").setType(types.TEXT);
  fields.newDimension().setId("DOMAIN_CODE").setName("DOMAIN_CODE").setType(types.TEXT);
  fields.newDimension().setId("COUNTRY_NAME").setName("COUNTRY_NAME").setType(types.TEXT);
  fields.newDimension().setId("COUNTRY_CODE").setName("COUNTRY_CODE").setType(types.TEXT);
  fields.newDimension().setId("PLATFORM_TYPE_NAME").setName("PLATFORM_TYPE_NAME").setType(types.TEXT);
  fields.newDimension().setId("PLATFORM_TYPE_CODE").setName("PLATFORM_TYPE_CODE").setType(types.TEXT);
  fields.newDimension().setId("TARGETING_TYPE_NAME").setName("TARGETING_TYPE_NAME").setType(types.TEXT);
  fields.newDimension().setId("TARGETING_TYPE_CODE").setName("TARGETING_TYPE_CODE").setType(types.TEXT);
  fields.newDimension().setId("CONTENT_PLATFORM_NAME").setName("CONTENT_PLATFORM_NAME").setType(types.TEXT);
  fields.newDimension().setId("CONTENT_PLATFORM_CODE").setName("CONTENT_PLATFORM_CODE").setType(types.TEXT);
  fields.newDimension().setId("AD_PLACEMENT_NAME").setName("AD_PLACEMENT_NAME").setType(types.TEXT);
  fields.newDimension().setId("AD_PLACEMENT_CODE").setName("AD_PLACEMENT_CODE").setType(types.TEXT);
  fields.newDimension().setId("REQUESTED_AD_TYPE_NAME").setName("REQUESTED_AD_TYPE_NAME").setType(types.TEXT);
  fields.newDimension().setId("SERVED_AD_TYPE_NAME").setName("SERVED_AD_TYPE_NAME").setType(types.TEXT);
  fields.newDimension().setId("SERVED_AD_TYPE_CODE").setName("SERVED_AD_TYPE_CODE").setType(types.TEXT);
  fields.newDimension().setId("AD_FORMAT_NAME").setName("AD_FORMAT_NAME").setType(types.TEXT);
  fields.newDimension().setId("AD_FORMAT_CODE").setName("AD_FORMAT_CODE").setType(types.TEXT);
  fields.newDimension().setId("CUSTOM_SEARCH_STYLE_NAME").setName("CUSTOM_SEARCH_STYLE_NAME").setType(types.TEXT);
  fields.newDimension().setId("CUSTOM_SEARCH_STYLE_ID").setName("CUSTOM_SEARCH_STYLE_ID").setType(types.TEXT);
  fields.newDimension().setId("DOMAIN_REGISTRANT").setName("DOMAIN_REGISTRANT").setType(types.TEXT);
  fields.newDimension().setId("WEBSEARCH_QUERY_STRING").setName("WEBSEARCH_QUERY_STRING").setType(types.TEXT);
  fields.newMetric().setId("PAGE_VIEWS").setName("PAGE_VIEWS").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("AD_REQUESTS").setName("AD_REQUESTS").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("MATCHED_AD_REQUESTS").setName("MATCHED_AD_REQUESTS").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("TOTAL_IMPRESSIONS").setName("TOTAL_IMPRESSIONS").setType(types.NUMBER).setAggregation(aggregations.SUM);
  fields.newMetric().setId("IMPRESSIONS").setName("IMPRESSIONS").setType(types.NUMBER).setAggregation(aggregations.AVG);
  fields.newMetric().setId("INDIVIDUAL_AD_IMPRESSIONS").setName("INDIVIDUAL_AD_IMPRESSIONS").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("CLICKS").setName("CLICKS").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("PAGE_VIEWS_SPAM_RATIO").setName("PAGE_VIEWS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("AD_REQUESTS_SPAM_RATIO").setName("AD_REQUESTS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("MATCHED_AD_REQUESTS_SPAM_RATIO").setName("MATCHED_AD_REQUESTS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("IMPRESSIONS_SPAM_RATIO").setName("IMPRESSIONS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("INDIVIDUAL_AD_IMPRESSIONS_SPAM_RATIO").setName("INDIVIDUAL_AD_IMPRESSIONS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("CLICKS_SPAM_RATIO").setName("CLICKS_SPAM_RATIO").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("AD_REQUESTS_COVERAGE").setName("AD_REQUESTS_COVERAGE").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("PAGE_VIEWS_CTR").setName("PAGE_VIEWS_CTR").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("AD_REQUESTS_CTR").setName("AD_REQUESTS_CTR").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("MATCHED_AD_REQUESTS_CTR").setName("MATCHED_AD_REQUESTS_CTR").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("IMPRESSIONS_CTR").setName("IMPRESSIONS_CTR").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("INDIVIDUAL_AD_IMPRESSIONS_CTR").setName("INDIVIDUAL_AD_IMPRESSIONS_CTR").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("ACTIVE_VIEW_MEASURABILITY").setName("ACTIVE_VIEW_MEASURABILITY").setType(types.NUMBER).setAggregation(aggregations.AVG).setIsReaggregatable(true);
  fields.newMetric().setId("ACTIVE_VIEW_VIEWABILITY").setName("ACTIVE_VIEW_VIEWABILITY").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("ACTIVE_VIEW_TIME").setName("ACTIVE_VIEW_TIME").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("ESTIMATED_EARNINGS").setName("ESTIMATED_EARNINGS").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("PAGE_VIEWS_RPM").setName("PAGE_VIEWS_RPM").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("AD_REQUESTS_RPM").setName("AD_REQUESTS_RPM").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("MATCHED_AD_REQUESTS_RPM").setName("MATCHED_AD_REQUESTS_RPM").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("IMPRESSIONS_RPM").setName("IMPRESSIONS_RPM").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("INDIVIDUAL_AD_IMPRESSIONS_RPM").setName("INDIVIDUAL_AD_IMPRESSIONS_RPM").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("COST_PER_CLICK").setName("COST_PER_CLICK").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("TOTAL_EARNINGS").setName("TOTAL_EARNINGS").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.newMetric().setId("WEBSEARCH_RESULT_PAGES").setName("WEBSEARCH_RESULT_PAGES").setType(types.NUMBER).setAggregation(aggregations.SUM).setIsReaggregatable(true);
  fields.setDefaultDimension("DATE");
  fields.setDefaultMetric("ESTIMATED_EARNINGS");
  return fields;
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
function getSchema(request) {
  //Logger.log(adsenseSchema);
  //return { schema: adsenseSchema };
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  return cc.newGetSchemaResponse().setFields(getFields()).build();
}

function getData(request) {
  var dimension =[];
  var metric =[];
  // Create schema for requested fields
  /*var requestedSchema = request.fields.map(function (field) {
    for (var i = 0; i < adsenseSchema.length; i++) {
      if (adsenseSchema[i].name == field.name) {
        if(adsenseSchema[i].semantics.conceptType =="DIMENSION"){
          dimension.push(adsenseSchema[i].name);
        }
        if(adsenseSchema[i].semantics.conceptType =="METRIC"){
          metric.push(adsenseSchema[i].name);
        }
        return adsenseSchema[i];
      }
    }
  });*/
  // Create schema for requested fields
  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );
  var arrRequestedFields = requestedFields.asArray();
  dimension = getFormatData(requestedFields,"dimension");
  metric = getFormatData(requestedFields,"metric");
  //console.log("get metric"+ metric);
  //var requestedSchema=[];
  //requestedSchema.push(adsenseSchema[15],adsenseSchema[50]);
  //console.log("request param" + request.configParams.name);
  //requestedSchema[];
  //requestedSchema.push()                
  var startDate ="";
  var endDate ="";
  //startDate= request.dateRange.startDate;
  //endDate= request.dateRange.endDate;
  if(request.dateRange.startDate!=""){
    startDate= request.dateRange.startDate;
  }
  if(request.dateRange.endDate!=""){
    endDate= request.dateRange.endDate;
  }
  /*requestedSchema.forEach(function (field) {
      if(field.semantics.conceptType =="DIMENSION"){
        dimension.push(field.name);
      }
      if(field.semantics.conceptType =="METRIC"){
        metric.push(field.name);
      }
  });*/
  
  var parsedResponse =  [];
  
  // getting dimension & metric
  /*if(generateReport('pub-4052078165537812',"2018-10-12","2018-10-19",["DATE"],["EARNINGS"]).length>0){
    parsedResponse=generateReport('pub-4052078165537812',"2018-10-12","2018-10-19",["DATE"],["EARNINGS"]);
  } */
  parsedResponse=generateReport(request.configParams.accountSelection,startDate,endDate,dimension,metric);
  if(parsedResponse.length>0){
    console.log("parsedResponse"+ JSON.stringify(parsedResponse));
    // Transform parsed data and filter for requested fields
    var requestedData = parsedResponse.map(function(ads) {
      // Logger.log(ads.DATE);
      var values = [];
      arrRequestedFields.forEach(function (field) {
        var fieldID = field.getId();
        switch (fieldID) {
          case 'AD_CLIENT_ID':
            values.push(ads.AD_CLIENT_ID);
            break;
          case 'AD_FORMAT_CODE':
            values.push(ads.AD_FORMAT_CODE);
            break;
          case 'AD_FORMAT_NAME':
            values.push(ads.AD_FORMAT_NAME);
            break;
          case 'AD_PLACEMENT_CODE':
            values.push(ads.AD_PLACEMENT_CODE);
            break;
          case 'AD_PLACEMENT_NAME':
            values.push(ads.AD_PLACEMENT_NAME);
            break;
          case 'AD_UNIT_CODE':
            values.push(ads.AD_UNIT_CODE);
            break;
          case 'AD_UNIT_ID':
            values.push(ads.AD_UNIT_ID);
            break;
          case 'AD_UNIT_NAME':
            values.push(ads.AD_UNIT_NAME);
            break;
          case 'AD_UNIT_SIZE_CODE':
            values.push(ads.AD_UNIT_SIZE_CODE);
            break;
          case 'AD_UNIT_SIZE_NAME':
            values.push(ads.AD_UNIT_SIZE_NAME);
            break;
          case 'BID_TYPE_CODE':
            values.push(ads.BID_TYPE_CODE);
            break;
          case 'BID_TYPE_NAME':
            values.push(ads.BID_TYPE_NAME);
            break;
          case 'BUYER_NETWORK_ID':
            values.push(ads.BUYER_NETWORK_ID);
            break;
          case 'BUYER_NETWORK_NAME':
            values.push(ads.BUYER_NETWORK_NAME);
            break;
          case 'COUNTRY_CODE':
            values.push(ads.COUNTRY_CODE);
            break;
          case 'COUNTRY_NAME':
            values.push(ads.COUNTRY_NAME);
            break;
          case 'CUSTOM_CHANNEL_CODE':
            values.push(ads.CUSTOM_CHANNEL_CODE);
            break;
          case 'CUSTOM_CHANNEL_ID':
            values.push(ads.CUSTOM_CHANNEL_ID);
            break;
          case 'CUSTOM_CHANNEL_NAME':
            values.push(ads.CUSTOM_CHANNEL_NAME);
            break;
          case 'DATE':
            if(typeof ads.DATE !== 'undefined'){
              var strDate = ads.DATE;
              var arrDate = strDate.split('-');
              var date = new Date(arrDate[0],arrDate[1],arrDate[2]);
              values.push(Utilities.formatDate(date, Session.getTimeZone(), 'yyyyMMdd'));
            }else{
              values.push(ads.DATE);
            }
            //values.push(ads.DATE);
            break;
          case 'DOMAIN_NAME':
            values.push(ads.DOMAIN_NAME);
            break;
          case 'MONTH':
            values.push(ads.MONTH);
            break;
          case 'PLATFORM_TYPE_CODE':
            values.push(ads.PLATFORM_TYPE_CODE);
            break;
          case 'PLATFORM_TYPE_NAME':
            values.push(ads.PLATFORM_TYPE_NAME);
            break;
          case 'PRODUCT_CODE':
            values.push(ads.PRODUCT_CODE);
            break;
          case 'PRODUCT_NAME':
            values.push(ads.PRODUCT_NAME);
            break;
          case 'REQUESTED_AD_TYPE_CODE':
            values.push(ads.REQUESTED_AD_TYPE_CODE);
            break;
          case 'REQUESTED_AD_TYPE_NAME':
            values.push(ads.REQUESTED_AD_TYPE_NAME);
            break;
          case 'SERVED_AD_TYPE_CODE':
            values.push(ads.SERVED_AD_TYPE_CODE);
            break;
          case 'SERVED_AD_TYPE_NAME':
            values.push(ads.SERVED_AD_TYPE_NAME);
            break;
          case 'TARGETING_TYPE_CODE':
            values.push(ads.TARGETING_TYPE_CODE);
            break;
          case 'TARGETING_TYPE_NAME':
            values.push(ads.TARGETING_TYPE_NAME);
            break;
          case 'URL_CHANNEL_ID':
            values.push(ads.URL_CHANNEL_ID);
            break;
          case 'URL_CHANNEL_NAME':
            values.push(ads.URL_CHANNEL_NAME);
            break;
          case 'WEEK':
            values.push(ads.WEEK);
            break;
          case 'TOTAL_EARNINGS':
            values.push(ads.TOTAL_EARNINGS);
            break;
          case 'AD_REQUESTS':
            values.push(ads.AD_REQUESTS);
            break;
          case 'AD_REQUESTS_COVERAGE':
            values.push(ads.AD_REQUESTS_COVERAGE);
            break;
          case 'AD_REQUESTS_CTR':
            values.push(ads.AD_REQUESTS_CTR);
            break;
          case 'AD_REQUESTS_RPM':
            values.push(ads.AD_REQUESTS_RPM);
            break;
          case 'CLICKS':
            values.push(ads.CLICKS);
            break;
          case 'COST_PER_CLICK':
            values.push(ads.COST_PER_CLICK);
            break;
          case 'IMPRESSIONS':
            values.push(ads.IMPRESSIONS);
            break;
          case 'IMPRESSIONS_CTR':
            values.push(ads.IMPRESSIONS_CTR);
            break;
          case 'IMPRESSIONS_RPM':
            values.push(ads.IMPRESSIONS_RPM);
            break;
          case 'INDIVIDUAL_AD_IMPRESSIONS':
            values.push(ads.INDIVIDUAL_AD_IMPRESSIONS);
            break;
          case 'INDIVIDUAL_AD_IMPRESSIONS_CTR':
            values.push(ads.INDIVIDUAL_AD_IMPRESSIONS_CTR);
            break;
          case 'INDIVIDUAL_AD_IMPRESSIONS_RPM':
            values.push(ads.INDIVIDUAL_AD_IMPRESSIONS_RPM);
            break;
          case 'MATCHED_AD_REQUESTS':
            values.push(ads.MATCHED_AD_REQUESTS);
            break;
          case 'MATCHED_AD_REQUESTS_CTR':
            values.push(ads.MATCHED_AD_REQUESTS_CTR);
            break;
          case 'MATCHED_AD_REQUESTS_RPM':
            values.push(ads.MATCHED_AD_REQUESTS_RPM);
            break;
          case 'PAGE_VIEWS':
            values.push(ads.PAGE_VIEWS);
            break;
          case 'PAGE_VIEWS_CTR':
            values.push(ads.PAGE_VIEWS_CTR);
            break;
          case 'PAGE_VIEWS_RPM':
            values.push(ads.PAGE_VIEWS_RPM);
            break;
          case 'ESTIMATED_EARNINGS':
            values.push(ads.ESTIMATED_EARNINGS);
            break;
          case 'ACCOUNT_NAME':
            values.push(request.configParams.accountSelection);
            break;
          default:
            values.push('');
        }
      });
      return { values: values };
    });
  }
  //var c = requestedFields;
  console.log(requestedData);
  console.log("Return Studio Request : " + JSON.stringify({schema: requestedFields,rows: requestedData}));
  return {schema : requestedFields.build(),rows: requestedData};
}


function listAdClients() {
  // Retrieve ad client list in pages and log data as we receive it.
  var pageToken;
  var client=[];
  var adClients;
  do {
      Logger.log(AdSense.Accounts.list);
      adClients = AdSense.Accounts.list({
      pageToken: pageToken
    });
    //Logger.log(adClients.accounts);
    if (adClients.accounts) {
      for (var i = 0; i < adClients.accounts.length; i++) {
        var adClient = adClients.accounts[i];
        Logger.log(adClient);
        
        client.push({"name":adClient.name,"id":adClient.id});
        Logger.log('Ad client for product "%s" with ID "%s" was found.',
            adClient.productCode, adClient.name);
        Logger.log('Supports reporting: %s',
            adClient.supportsReporting ? 'Yes' : 'No');
      }
    } else {
     // Logger.log('No ad clients found.');
    }
    pageToken = adClients.nextPageToken;
  } while (pageToken);
  return client;
}
function generateReport(adClientName,startDate,endDate,dimension,metric) {
  //adClientName = 'accounts/pub-4052078165537812';
  //dimension=['DATE'],metric=['TOTAL_EARNINGS'];
  //startDate="2019-10-12",endDate="2019-10-19";
  //dimension.push("DATE");
  //metric.push("EARNINGS");
  // Prepare report.
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  var timezone = Session.getTimeZone();
  if(startDate==""|startDate=="undefined"){
    //var startDate = Utilities.formatDate(oneWeekAgo, timezone, 'yyyy-MM-dd');
    startDate = oneWeekAgo;
  }
  if(endDate==""|endDate=="undefined"){
   //var endDate = Utilities.formatDate(today, timezone, 'yyyy-MM-dd');
    endDate = today;
  }
  console.log('Print adClientName ' + adClientName );
  console.log('Dimension ' + dimension );
  console.log('Metric ' + metric );
  var adsenseReport =[];
  var report = AdSense.Accounts.Reports.generate(adClientName,{
    // Specify the desired ad client using a filter.
    "currencyCode":"EUR",
    "dimensions": dimension,
    "metrics": metric,
    "dateRange":"CUSTOM",
    "startDate.day":startDate.getDate(),
    "startDate.month":startDate.getMonth(),
    "startDate.year":startDate.getFullYear(),
    "endDate.day":endDate.getDate(),
    "endDate.month":endDate.getMonth()+1,
    "endDate.year":endDate.getFullYear(),
    "reportingTimeZone" : "ACCOUNT_TIME_ZONE"
  });
  //console.log("report"+report);
  //console.log("headers"+report.headers);
  //console.log("rows"+report.rows.length);
  if (report.rows.length>0) {
    var rows = report.rows;
    var headers = report.headers;
    for(var i=0;i<rows.length;i++){
      var row = rows[i];
      var cell = row.cells;
      var arrReport={};
      var j=0;
      headers.forEach(function(item){ 
        var name =item.name;
        var valCell = cell[j];
        arrReport[name]=valCell.value;
        j++;
      });
     //console.log("AdSense Report"+arrReport);
      adsenseReport.push(arrReport);
    }
  } else {
    console.log('No rows returned.');
  }
  //console.log("AdSense Report"+adsenseReport);
  return adsenseReport;
}
function escapeFilterParameter(parameter) {
  return parameter.replace('\\', '\\\\').replace(',', '\\,');
}
/**
 * Logs the time taken to execute 'myFunction'.
 */
function measuringExecutionTime() {
  // A simple INFO log message, using sprintf() formatting.
  console.info('Timing the %s function (%d arguments)', 'getData', 1);
  // Log a JSON object at a DEBUG level. The log is labeled
  // with the message string in the log viewer, and the JSON content
  // is displayed in the expanded log structure under "structPayload".
  var parameters = {
      isValid: true,
      content: 'some string',
      timestamp: new Date()
  };
  console.log({message: 'Function Input', initialData: parameters});

  var label = 'getData() time'; // Labels the timing log entry.
  console.time(label); // Starts the timer.
  try {
    myFunction(parameters); // Function to time.
  } catch (e) {
    // Logs an ERROR message.
    console.error('getData() yielded an error: ' + e);
  }
  console.timeEnd(label); // Stops the timer, logs execution duration.
}
function dateToJson (paramName, value) {
  var year = paramName + '.year';
  var month = paramName + '.month';
  var day = paramName + '.day';
  return { year: value.getFullYear(), month: value.getMonth() + 1,
    day: value.getDate()
  };
}
