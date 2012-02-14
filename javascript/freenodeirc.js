/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.freenodeirc
     *
     * @class freenodeirc
     *
     * @description
     * freenodeirc is a dashboard widget that embeds the freenode web client
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.freenodeirc = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var DEFAULT_CHANNEL = "sakai";

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#freenodeirc_main", $rootel);
        var $settingsContainer = $("#freenodeirc_settings", $rootel);
        var $settingsForm = $("#freenodeirc_settings_form", $rootel);
        var $cancelSettings = $("#freenodeirc_cancel_settings", $rootel);
        var $channel = $("#freenodeirc_channel", $rootel);
        var $isPrompt = $("#freenodeirc_prompt", $rootel);
        var $chatIframe = $('#freenodeirc_chatframe', $rootel);

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Checks if the provided channel argument is non-empty and returns the channel
         * if not empty; if empty, returns the DEFAULT_CHANNEL
         *
         * @param {String} channel The name of the irc channel
         */
        var checkChannelArgument = function (channel) {
            // check if color exists and is not an empty string
            return (channel && $.trim(channel)) ? $.trim(channel) : DEFAULT_CHANNEL;
        };

        /**
         * Gets the preferred channel from the server using an asynchronous request
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the name of the preferred channel.
         */
        var getPreferredChannel = function (callback) {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function (success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    callback(checkChannelArgument(data.channel), data.isPrompt);
                } else {
                    // fetching the data failed, we use the DEFAULT_COLOR
                    callback(DEFAULT_CHANNEL, false);
                }
            });
        };


        /////////////////////////
        // Main View functions //
        /////////////////////////

        /**
         * Shows the Main view that contains the freenode web client
         *
         * @param {String} channel The channel to connect to
         *          * (i.e. "#sakai")
         */
        var showMainView = function (channel, isPrompt) {
            // get data about the current user
            var me = sakai.data.me;
            var nick = sakai.api.User.getFirstName(me.profile).toLowerCase();
            var promptVal = isPrompt? 1 : 0;

            var chatUrl = "http://webchat.freenode.net?nick=" + nick + "&channels=" + channel + "&prompt=" + promptVal + "&uio=d4";

            $chatIframe.attr('src', chatUrl);

            // show the Main container
            $mainContainer.show();
        };


        /////////////////////////////
        // Settings View functions //
        /////////////////////////////

        /**
         * Sets the Settings view to the given settings
         *
         * @param {String} channel The name of the channel
         */
        var renderSettings = function (channel, isPrompt) {
            // set the channel to the given value
            $channel.val(checkChannelArgument(channel));
            if (isPrompt) {
                $isPrompt.attr('checked', 'checked');
            } else {
                $isPrompt.removeAttr('checked');
            }
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        /** Binds Settings form */
        $settingsForm.bind("submit", function (ev) {
            // get the selected channel
            var channel = $channel.val();
            var isPrompt = $isPrompt.is(':checked');

            // save the selected channel
            sakai.api.Widgets.saveWidgetData(tuid, {
                channel: channel,
                isPrompt: isPrompt
            },
                function (success, data) {
                    if (success) {
                        // Settings finished, switch to Main view
                        sakai.api.Widgets.Container.informFinish(tuid, "freenodeirc");
                    }
                }
            );
            return false;
        });

        $cancelSettings.bind("click", function(){
            sakai.api.Widgets.Container.informFinish(tuid, "freenodeirc");
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function () {
            if (showSettings) {
                // set up Settings view

                getPreferredChannel(renderSettings);

                // show the Settings view
                $settingsContainer.show();
            } else {
                // set up Main view

                // get the preferred color and show the Main view
                getPreferredChannel(showMainView);
            }
        };

        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("freenodeirc");
});
