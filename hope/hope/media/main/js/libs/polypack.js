
function PolyPack()
{
	var i,j,k,l;

	l=[];

	for (i=0;k="0123456789ABCDEFGHIJKLOPQRSTUVWXYZabcdefghijklopqrstuvwxyz*+,-./".charAt(i);i++)
	{
	j=("000000"+i.toString(2)).slice(-6);

		l[j]=k;

		l[k]=j;
	}

	this.pair=l;
}

PolyPack.prototype.offset=268435456;

PolyPack.prototype.radius=268435456/Math.PI;

PolyPack.prototype.degree=180/Math.PI;

PolyPack.prototype.LToX=function(x)
{
	return Math.round(this.offset+this.radius*x/this.degree);
}

PolyPack.prototype.LToY=function(y)
{
	return Math.round(this.offset-this.radius*Math.log((1+Math.sin(y/this.degree))/(1-Math.sin(y/this.degree)))/2);
}

PolyPack.prototype.XToL=function(x)
{
	return this.degree*(Math.round(x)-this.offset)/this.radius;
}

PolyPack.prototype.YToL=function(y)
{
	return this.degree*(Math.PI/2-2*Math.atan(Math.exp((Math.round(y)-this.offset)/this.radius)));
}

PolyPack.prototype.Pack=function(poly,pack)
{
	var i,j,k,l,o,p,q,r,s,t,u,v,w,x,y,z;

	l=poly;

	q=pack ? (21-pack) : 0;

	s=0;
	t=0;

	x=[];
	y=[];

	for (i=0;l[i];i++)
	{
		w=this.LToX(l[i].x)>>q;

		s=w-s;

		z=Math.abs(s).toString(2).replace(/0*1?/,"");

		x[i]=s ? (("00000"+(z.length+1).toString(2)+(-(s>>31))).slice(-6)+z) : "00000";

		s=w;
	}

	x[i]="11111";

	for (i=0;l[i];i++)
	{
		w=this.LToY(l[i].y)>>q;

		t=w-t;

		z=Math.abs(t).toString(2).replace(/0*1?/,"");

		y[i]=t ? (("00000"+(z.length+1).toString(2)+(-(t>>31))).slice(-6)+z) : "00000";

		t=w;
	}

	y[i]="11111";

	s=x.join("");
	t=y.join("");

	x=[];
	y=[];

	for (i=0,j=0;s.charAt(j+5);i+=1,j+=6)
	{
		x[i]=this.pair[s.slice(j,j+6)];
	}

	for (i=0,j=0;t.charAt(j+5);i+=1,j+=6)
	{
		y[i]=this.pair[t.slice(j,j+6)];
	}

	return {x:x.join(""),y:y.join("")};
}

PolyPack.prototype.Poly=function(poly,pack)
{
	var i,j,k,l,o,p,q,r,s,t,u,v,w,x,y,z;

	l=poly;

	q=pack ? (21-pack) : 0;

	s=l.x;
	t=l.y;

	x=[];
	y=[];

	for (i=0;s.charAt(i);i++)
	{
		x[i]=this.pair[s.charAt(i)];
	}

	for (i=0;t.charAt(i);i++)
	{
		y[i]=this.pair[t.charAt(i)];
	}

	s=x.join("");
	t=y.join("");

	x=[];
	y=[];

	w=0;

	for (i=0,j=0;s.charAt(j+4);i++,j++)
	{
		k=j+5;

		l=parseInt(s.slice(j,k),2);

		j=k-1+l;

		z=1<<l>>1;

		if (l>>1<<1)
		{
			if (!s.charAt(j)) break;

			z=z+parseInt(s.slice(k+1,j+1),2);
		}

		if (z)
		{
			if (!s.charAt(k)) break;

			z=[z-0,0-z][s.charAt(k)-0];
		}

		w=w+z;

		x[i]=this.XToL(w<<q);
	}

	w=0;

	for (i=0,j=0;t.charAt(j+4);i++,j++)
	{
		k=j+5;

		l=parseInt(t.slice(j,k),2);

		j=k-1+l;

		z=1<<l>>1;

		if (l>>1<<1)
		{
			if (!t.charAt(j)) break;

			z=z+parseInt(t.slice(k+1,j+1),2);
		}

		if (z)
		{
			if (!t.charAt(k)) break;

			z=[z-0,0-z][t.charAt(k)-0];
		}

		w=w+z;

		y[i]=this.YToL(w<<q);
	}

	return {x:x,y:y};
}
