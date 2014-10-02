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
    },

    addDate: function (d) {
      var date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
      date = date.getFullYear() + '/' + this.pad(date.getMonth() + 1) + '/' + this.pad(date.getDate());
      return date;
    },

    subDate: function (d) {
      var date = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7);
      date = date.getFullYear() + '/' + this.pad(date.getMonth() + 1) + '/' + this.pad(date.getDate());
      return date;
    },

    changeDateFormat: function (d) {
      var date = d.getFullYear() + '/' + this.pad(d.getMonth() + 1) + '/' + this.pad(d.getDate());
      return date;
    },

    pad: function (d) {
      d = d.toString();
      if (d.length == 1) {
        return '0' + d;
      }
      return d;
    }

  };

  /**
   * @namespace LOG_VISUALIZE
   * @class DatabaseAccess
   */
  var DatabaseAccess = function () {
    this.APP_URL = 'http://cld3-api.145.kp/';
    this.APP_PATH = 'wflog/';
  };

  DatabaseAccess.prototype = {
    
    /**
     * @method getLoginList
     * @return {object}
     */
    getLoginList: function (from, to) {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: this.APP_URL + this.APP_PATH + '/hourlogin',
        //url: 'json/login.json'
        data: { from: from, to: to }
      });
    },

    /**
     * @method getLocationList
     * @return {object}
     */
    getLocationList: function (from, to) {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        //url: 'json/location.json'
        url: this.APP_URL + this.APP_PATH + 'upip',
        data: { from: from, to: to }
      });
    },

    /**
     * @method getLocation
     * @return {object}
     */
    getLonLat: function (ip) {
      return $.ajax({
        dataType: 'JSON',
        url: 'http://cld3.145.kp/geoip/index.php',
        type: 'POST',
        data: { 'ip': ip }
      });
    },

    /**
     * @method getUploadList
     * @return {object}
     */
    getUploadList: function (from, to) {
      return $.ajax({
        type: 'GET',
        datatype: 'JSON',
        url: this.APP_URL + this.APP_PATH + 'countupsize',
        //url: 'json/upload.json'
        data: {from: from, to: to}
      });
    },

    /**
     * @method getLogUploadAll
     * @return {object}
     */
    getLogUploadAll: function () {
      return $.ajax({
        dataType: 'JSON',
        url: this.APP_URL + this.APP_PATH + 'hourupsize',
        type: 'GET'
      });
    },

    /**
     * @method getCountUpSize
     * @return {object}
     */
    getCountUpSize: function (from, to) {
      return $.ajax({
        dataType: 'JSON',
        url: this.APP_URL + this.APP_PATH + 'countupsize',
        data: { from: from, to: to },
        type: 'GET'
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
