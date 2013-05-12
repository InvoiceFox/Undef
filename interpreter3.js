var Bagel = function(dbg) {

    var d = function(x){if(dbg){console.log(x)};return x}

    this.evalu = function(block, pos, state) { 	d(block);d("%%");d(pos);d(state);
	while (pos < block.length) {
	    e = evalexpr(block,pos,state);
	    pos = e[1];
	    state = e[2];
	    if (e.length > 3) { if(e[3]=="error"){d(e)} return e; }
	}
	return e;
    }
    
    var evalexpr = function(block,pos,state) {	d("--->>>");d(pos);d(block[pos]);d("<<<---");
	switch(block[pos][0]) 
	    { 
	    case "word": 
		return d(proc_word(block[pos][1],block,pos,state));
	    case "setword": 
		return proc_setword(block[pos][1],block,pos,state);
	    case "number":
		return [block[pos][1],pos+1,state];
	    case "block": 
		return [block[pos],pos+1,state];
	    default:
		return ["#ERROR 3 (item not understoof)# next to",pos+1,state,"error"];
	    }
    }
    
    var evalword = function(word,block,pos,state) {	//d("WW-->>>");d(pos);d(block);d("<<<---");
	if (state[word] instanceof Array) {
	    switch(d(state[word][0]))
    	    { 
	    case "fndef": 
		return call_user_fn(state[word][1],state[word][2],block,pos,state);
	    default:
		return [state[word],pos+1,state];
	    }
	} else {
	    return [state[word],pos+1,state]; 	
	}
    }
    
    var proc_setword = function(word, block, pos, state)
    {
	var r = evalexpr(block,pos+1,state);
	state[word] = r[0];
	r[2]=state;
	return r;
    };

    var proc_word = function(word, block, pos, state)
    {
	if (word == "yield") {                            // TODO: we should define functs similar to native (example: selfaware which accept word,block,pos,state and are meant for)
	                                                  // and dispatch to them, not have if else here directly
	    d("/////////////////////////////////77777777777");
	    e = evalexpr(block,pos+1,state);
	    pos = e[1];
	    state = e[2];
	    return [e[0],pos,state,"yield",block];	//TODO: the freezed state from yield should be it's own type
	} else if (word == "cont") {
	    d("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\....");
	    e = evalexpr(block,pos+1,state);
	    pos = e[1];
	    state = e[2];
	    return call_yielded(e[0],block,pos,state);
	} else if (this.natives[word]) {
	    var nat = this.natives[word];
	    if (typeof nat == "function") 
		{
		    var args = []
			pos += 1;
			for (var i=1;i<=nat.length;i+=1) {
			    var e = evalexpr(block,pos,state);
			    pos = e[1];
			    state = e[2];
			    args.push(e[0]);
			}
		    return [nat.apply(null, args),pos,state];
		}
	    else
		{
		    return ["#error 2 (native not really funtion)#",pos+1,state,"error"];
		}
	} else if (state[word]) {
	    return evalword(word,block,pos,state);
	} else {
	    return ["#error 1 (word not defined (not user not native))#",pos+1,state,"error"];
	}
    }
    
    var call_user_fn = function(h,b,block,pos,state) {
	var lctx = {}
	pos += 1;
	for (var i=1;i<h.length;i+=1) {
	    var e = evalexpr(block,pos,state);
	    pos = e[1];
	    state = e[2];
	    lctx[h[i][1]] = e[0];
	}
	r = this.evalu(b,1,lctx);
	return [r.length>3?r:r[0],pos,state];
    }
    
    var call_yielded = function(frz,block,pos,state) {
	r = this.evalu(frz[4],frz[1],frz[2]);
	return [r.length>3?r:r[0], pos,state];
    }
    
    var __fillctx = function(c,b) { //todo preset with b, figure out what or how at all
	var r = {};
	for(i=1;i<c[1].length;i+=1) {
	    if(c[1][i][0]=="word"){r[c[1][i][1]]=null}
	}
	return r;
    }

    this.natives = { 
	ctx: function(def) { return [ 'ctxdef', def ] },
	fn: function(h,b) { return [ 'fndef', h, b ] },
	unit: function(a) { return a },  
	inc: function(a){return a + 1},
	add: function(a,b) { return a + b },  
	alert: function(a){alert(a)},
	makectx: function(c){ return [ 'ctx', __fillctx(c,{}) ] }
    }
	
    return this;
}
