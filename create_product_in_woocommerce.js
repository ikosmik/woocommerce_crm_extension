  /**  Create Products in the WooCommerce Site when a new product is added to the Zoho CRM
   *
   * (Required details : Product Name, SKU, Unit Price, Product Description) 
   * 
   **/
   support_mail="hello@cubeyogi.com"
   has_synchronisation_issue = false;
    product_record_id = input.product.get("Products.ID");
    if ((product_record_id  !=  null)  &&  (toLong(product_record_id)  !=  null))
    {
        error_msg = "";
        is_field_missing = false;
        organisationWoocommerceDetails = "";
        return_map = map();
        
        //Check whether the woocommerce details are provided and also the provided information is correctly synced with             the account
        active_woocommerce_details = zoho.crm.searchRecords("CustomModule3", "(Status|=|true)");
        responseMap = (active_woocommerce_details.toString()).toMap();
        if (responseMap  !=  null)
        {
            if (responseMap.get("CUSTOMMODULE3_ID")  !=  null)
            {
                parameters = "";
                is_fields_missing = false;
         
                //Get the "Consumer Key" from the module "WooCommerce Site", if not found inform that the required                           informations are missing 
                if ((responseMap.get("Consumer Key")  !=  null)  &&  (responseMap.get("Consumer Key")  !=  ""))
                {
                    parameters = parameters + "&consumer_key=" + zoho.encryption.urlEncode(responseMap.get("Consumer Key"));
                }
                else
                {
                    is_fields_missing = true;
                }
                
                //Get the "Site URL" from the module "WooCommerce Site", if not found inform that the required                               informations are missing 
                if ((responseMap.get("Site URL")  !=  null)  &&  (responseMap.get("Site URL")  !=  ""))
                {
                    parameters = parameters + "&site_url=" + zoho.encryption.urlEncode(responseMap.get("Site URL"));
                }
                else
                {
                    is_fields_missing = true;
                }
                
                //Get the "Consumer Secret Key" from the module "WooCommerce Site", if not found inform that the required informations are missing 
                if ((responseMap.get("Consumer Secret Key")  !=  null)  &&  (responseMap.get("Consumer Secret Key")  !=  ""))
                {
                    parameters = parameters + "&consumer_secret_key=" + zoho.encryption.urlEncode(responseMap.get("Consumer Secret Key"));
                }
                else
                {
                    is_fields_missing = true;
                }
                if (((parameters  !=  null)  &&  (parameters  !=  ""))  &&  !is_fields_missing)
                {
                  
                    return_map.put("code", "200")  //Code 200 - to indicate that the required organisation setup informations are provided
                    return_map.put("response", parameters);
                   
                }
                else
                {
                   
                    return_map.put("code", "400"); //Code 400 - to indicate that the required organisation setup informations are missing
                    return_map.put("response", "Fields Missing");
                   
                }
            }
        }
        else
        {
            return_map.put("code", "401");  //Code 401 - to indicate that the required organisation setup informations are not provided in the "WooCommerce Site" Module
            return_map.put("response", "No Details Found");
        }
        woocommerce_info = return_map;
        if (woocommerce_info  !=  null)
        {
            woocommerce_info_map = (woocommerce_info.toString()).toMap();
            if (woocommerce_info_map.get("code")  ==  "200")
            {
                //All the required details are provided
                organisationWoocommerceDetails = woocommerce_info_map.get("response");
            }
            //Insert the failure case with its reason into the Audit Log
            if (woocommerce_info_map.get("code")  ==  "400")
            {
                //fields missing
                is_field_missing = true;
                has_synchronisation_issue = true;
                log_details = map();
                log_details.put("Audit Log Name", "Woocomerce Extension");
                log_details.put("Action", "Create");
                log_details.put("Module", "Products");
                log_details.put("Severity", "Error");
                log_details.put("Details", "Missing Woocommerce Information in Woocommerce Site Details");
                log_details.put("Response", woocommerce_info);
                log_details.put("Done on", zoho.currenttime);
                log_response = zoho.crm.create("CustomModule2", log_details);
               
            }
            if (woocommerce_info_map.get("code")  ==  "401")
            {
                //No Details found
                is_field_missing = true;
                has_synchronisation_issue = true;
                log_details = map();
                log_details.put("Audit Log Name", "Woocomerce Extension");
                log_details.put("Action", "Create");
                log_details.put("Module", "Products");
                log_details.put("Severity", "Error");
                log_details.put("Details", "Failure in Woocommerce Synchronisation");
                log_details.put("Response", woocommerce_info);
                log_details.put("Done on", zoho.currenttime);
                log_response = zoho.crm.create("CustomModule2", log_details);
               
            }
        }
        if (!is_field_missing)
        {
            //Get the informations of the created product
            fetch_record = zoho.crm.getRecordById("Products", toLong(product_record_id));
           
            if (fetch_record  !=  null)
            {
                parameters = "";
                product_map = map();
                create_product_url = "http://awesomesimple.96.lt/Zoho%20CRM%20Extension/CRM-Woocommerce/insert_crm_products_in_woocommerce.php?";
               
                //Parse the response to get the product informations
                //Form parameters to be attached with the URL only if the item name is not null
                if ((fetch_record.get("Product Name")  !=  null)  &&  (fetch_record.get("Product Name")  !=  ""))
                {
                    parameters = parameters + "name=" + zoho.encryption.urlEncode(ifnull(fetch_record.get("Product Name"),""));
                    if ((fetch_record.get("Description")  !=  null)  &&  (fetch_record.get("Description")  !=  ""))
                    {
                        parameters = parameters + "&description=" + zoho.encryption.urlEncode(ifnull(fetch_record.get("Description"),""));
                    }
                    if ((fetch_record.get("Product Code")  !=  null)  &&  (fetch_record.get("Product Code")  !=  ""))
                    {
                        parameters = parameters + "&sku=" + zoho.encryption.urlEncode(ifnull(fetch_record.get("Product Code"),""));
                    }
                    if ((fetch_record.get("Unit Price")  !=  null)  &&  (fetch_record.get("Unit Price")  !=  ""))
                    {
                        parameters = parameters + "&price=" + zoho.encryption.urlEncode(ifnull(fetch_record.get("Unit Price"),""));
                    }
                    if ((fetch_record.get("WooCommerce Product Category ")  !=  null)  &&  (fetch_record.get("WooCommerce Product Category ")  !=  ""))
                    {
                        /**
                          *  i)Check whether the Category is available in the Zoho CRM as well as WooCommerce Site , if so get 	 				 
                          *  the "Category ID" of the choosen Product Category 
                          *  ii) If not found, then first create Category in the WooCommerce Site and parse the response to get 				
                          *  the "Category ID"
                          */
                        search_response = zoho.crm.searchRecords("CustomModule1", ("(Product Category Name|=|" + fetch_record.get("WooCommerce Product Category ")) + ")");
                        search_map = (search_response.toString()).toMap();
                        if ((search_map.get("WooCommerce Category ID")  ==  null)  ||  (search_map.get("WooCommerce Category ID")  ==  ""))
                        {
                            category_create_url = "http://awesomesimple.96.lt/Zoho%20CRM%20Extension/CRM-Woocommerce/create_category_in_woocommerce.php?";
                            if ((search_map.get("CUSTOMMODULE1_ID")  ==  null)  ||  (search_map.get("CUSTOMMODULE1_ID")  ==  ""))
                            {
                                category_parameters = ("category_name=" + fetch_record.get("WooCommerce Product Category ")) + organisationWoocommerceDetails;
                            }
                            else
                            {
                                category_details = zoho.crm.getRecordById("CustomModule1", toLong(search_map.get("CUSTOMMODULE1_ID")));
                                category_parameters = ((((((("category_name=" + ifnull(category_details.get("Product Category Name"),"")) + "&category_slug=") + ifnull(category_details.get("Slug"),"")) + "&category_description=") + ifnull(category_details.get("Category Description"),"")) + "&category_count=") + ifnull(category_details.get("Count"),"")) + organisationWoocommerceDetails;
                            }
                            if ((((category_create_url  !=  null)  &&  (category_create_url  !=  ""))  &&  (category_parameters  !=  null))  &&  (category_parameters  !=  ""))
                            {
                                category_map = map();
                                category_response = postUrl(category_create_url + category_parameters, category_map);
                               
                                woocommerce_category_response = category_response.toMap();
                                if (((woocommerce_category_response  !=  null)  &&  (woocommerce_category_response.get("id")  !=  null))  &&  (woocommerce_category_response.get("id")  !=  ""))
                                {
                                    log_details = map();
                                    log_details.put("Audit Log Name", "Woocomerce Extension");
                                    log_details.put("Action", "Create");
                                    log_details.put("Module", "Products");
                                    log_details.put("Severity", "Success");
                                    log_details.put("Details", (("Product Category is created in Woocommerce for the record:" + search_map.get("CUSTOMMODULE1_ID")) + " and the woocommerce ID is ") + woocommerce_category_response.get("id"));
                                    log_details.put("Response", category_response);
                                    log_details.put("Done on", zoho.currenttime);
                                    log_response = zoho.crm.create("CustomModule2", log_details);
                                    if ((search_map.get("CUSTOMMODULE1_ID")  !=  null)  &&  (search_map.get("CUSTOMMODULE1_ID")  !=  ""))
                                    {
                                        updateCategoryMap = map();
                                        updateCategoryMap.put("id", search_map.get("CUSTOMMODULE1_ID"));
                                        updateCategoryMap.put("zohocrmtowoocommercesync.WooCommerce_Category_ID", (woocommerce_category_response.get("id")) + "");
                                        updateCategoryDetails = List();
                                        updateCategoryDetails.add(updateCategoryMap);
                                        updateMap = { "module" : "zohocrmtowoocommercesync.Product_Category", "data" : updateCategoryDetails };
                                        crmResp = zoho.crm.invokeConnector("crm.update", updateMap);
                                       
                                    }
                                    else
                                    {
                                        category_map = map();
                                        category_map.put("Product Category Name", fetch_record.get("WooCommerce Product Category "));
                                        category_map.put("WooCommerce Category ID", woocommerce_category_response.get("id"));
                                        create_category = zoho.crm.create("CustomModule1", category_map);
                                       
                                    }
                                    parameters = parameters + "&product_category=" + zoho.encryption.urlEncode(woocommerce_category_response.get("id"));
                                }
                                else
                                {
                                    log_details = map();
                                    log_details.put("Audit Log Name", "Woocomerce Extension");
                                    log_details.put("Action", "Create");
                                    log_details.put("Module", "Products");
                                    log_details.put("Severity", "Error");
                                    log_details.put("Details", "Product Category is not created in Woocommerce for the record:" + search_map.get("CUSTOMMODULE1_ID"));
                                    log_details.put("Response", category_response);
                                    log_details.put("Done on", zoho.currenttime);
                                    log_response = zoho.crm.create("CustomModule2", log_details);
                                }
                            }
                        }
                        else if ((search_map.get("WooCommerce Category ID")  !=  null)  &&  (search_map.get("WooCommerce Category ID")  !=  ""))
                        {
                            parameters = parameters + "&product_category=" + search_map.get("WooCommerce Category ID");
                        }
                    }
                    if ((fetch_record.get("is Live On Website")  !=  null)  &&  (fetch_record.get("is Live On Website")  ==  "true"))
                    {
                        parameters = parameters + "&status=" + zoho.encryption.urlEncode("publish");
                    }
                    else
                    {
                        parameters = parameters + "&status=" + zoho.encryption.urlEncode("draft");
                    }
                    if (((((create_product_url  !=  null)  &&  (create_product_url  !=  ""))  &&  (parameters  !=  null))  &&  (parameters  !=  ""))  &&  (product_map  !=  null))
                    {
                        parameters = parameters + "&catalog_visiblity=" + zoho.encryption.urlEncode("visible");
                        // 	Send a POST Request to insert the product into the WooCommerce Site and parse the response to 							  check the status of the request
                        product_created_response = postUrl(create_product_url + parameters + organisationWoocommerceDetails, product_map);
                        //Parse the response to get the WooCommerce ID of the product and its Permalink 
                        //Update those informations into the product record details in the Zoho CRM
                        product_created_response_map = product_created_response.toMap();
                        woocommerce_id = product_created_response_map.get("id");
                        website_link = product_created_response_map.get("permalink");
                        if (woocommerce_id  !=  null)
                        {
                            //Get details of the permalink and can be updated in the CRM records.
                            reference_map = map();
                            reference_map.put("zohocrmtowoocommercesync.WooCommerce_Product_ID", woocommerce_id);
                            reference_map.put("zohocrmtowoocommercesync.WooCommerce_Product_Link", website_link);
                            reference_map.put("id", product_record_id);
                            //update_response = zoho.crm.updateRecord("Products", product_record_id, reference_map);
                            updateProductDetails = List();
                            updateProductDetails.add(reference_map);
                            updateMap = { "module" : "Products", "data" : updateProductDetails };
                            crmResp = zoho.crm.invokeConnector("crm.update", updateMap);
                            //Insert into the Audit Log to notify that the product is created in WooCommerce Site
                            log_details = map();
                            log_details.put("Action", "Create");
                            log_details.put("Audit Log Name", "Woocommerce Extension");
                            log_details.put("Module", "Products");
                            log_details.put("Severity", "Success");
                            log_details.put("Details", "Product is Created in Woocommerce for the record :" + product_record_id + " and woocommerce ID is" + woocommerce_id);
                            log_details.put("Response", product_created_response);
                            log_details.put("Done on", zoho.currenttime);
                            log_response = zoho.crm.create("CustomModule2", log_details);
                            info log_response;
                        }
                        else
                        {
                            log_details = map();
                            log_details.put("Audit Log Name", "Woocomerce Extension");
                            log_details.put("Action", "Create");
                            log_details.put("Module", "Products");
                            log_details.put("Severity", "Error");
                            log_details.put("Details", "Product is not created in Woocommerce for the record:" + product_record_id);
                            log_details.put("Response", product_created_response);
                            log_details.put("Done on", zoho.currenttime);
                            log_response = zoho.crm.create("CustomModule2", log_details);
                            info log_response;
                        }
                    }
                }
            }
        }
    }
    if (has_synchronisation_issue)
    {
        sendmail
        (
            To       :  support_mail
            From     :  zoho.adminuserid 
            Subject  :  "ZohoCRMtoWooCommerce Extension - Failed to Integrate with WooCommerce Details" 
            Message  :  ((((("Product(s) cannot be created in the WooCommerce Site because of failure in the integration.Please check the WooCommerce Integration details are entered and it is valid.\nThe details provided by you are \n<center><table><tr><td>Site URL</td><td>" + zoho.crm.getOrgVariable("zohocrmtowoocommercesync.site_url")) + "</td></tr><td>Consumer Key</td><td>") + zoho.crm.getOrgVariable("zohocrmtowoocommercesync.consumer_key")) + "</td></tr><tr><td>Consumer Secret Key</td><td>") + zoho.crm.getOrgVariable("zohocrmtowoocommercesync.consumer_secret_key")) + "</td></tr></table></center>" 
        )
    }
