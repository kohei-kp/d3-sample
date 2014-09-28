function D(params){
    return function(d, i){
        if(typeof params ==='function') { return params(d) }
        else if( typeof params ==='string'){ return (new Function( 'return (' + d + params + ')' )()) }
        else { return d};
    }
}

function I(params){
    return function(d, i){
        if(typeof params ==='function') { return params(i) }
        else if( typeof params ==='string'){ return (new Function( 'return (' + i + params + ')' )()) }
        else { return i};
    }
}

function F(name){
  var params=Array.prototype.slice.call(arguments,1);  
    return function(d){
        if(typeof params[0] ==='function') { return params[0](d[name]) }
        else if( typeof params[0] ==='string'){ return (new Function( 'return (' + d[name] + params[0] + ')' )()) }
        else if( typeof name === 'object' ){ return name }
        else { return d[name]};
    }
}
