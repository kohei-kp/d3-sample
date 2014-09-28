var LOG_VISUALISE = LOG_VISUALISE || {};

(function () {
  /**
   * @namespace LOG_VISUALIZE
   * @class Util
   */
  var Util = function () {};

  Util.prototype = {
    
    /**
     * @method createSVG
     * @param {string} select
     * @param {number} w
     * @param {number} h
     * @return {object} svg
     */
    createSVG: function (select, w, h) {
      var svg = d3.select(select).append('svg').attr({ width: w, height: h });

      return svg;
    }
  };

  /**
   * @namespace LOG_VISUALIZE
   * @class DatabaseAccess
   */
  var DatabaseAccess = function () {};

  DatabaseAccess.prototype = {
    
    /**
     * @method getLoginList
     * @return {object}
     */
    getLoginList: function () {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: 'json/login.json'
      });
    },

    /**
     * @method getLocationList
     * @return {object}
     */
    getLocationList: function () {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: 'json/location.json'
      });
    },

    /**
     * @method getUploadList
     * @return {object}
     */
    getUploadList: function () {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: 'json/upload.json'
      });
    },

    /**
     * @method getArea (example)
     * @return {object}
     */
    getArea: function () {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: 'json/area.json'
      });
    }

  };

  LOG_VISUALIZE = {
    Util: Util,
    DatabaseAccess: DatabaseAccess
  };
}());
