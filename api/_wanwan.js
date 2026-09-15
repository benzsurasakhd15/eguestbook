const crypto = require('crypto');
const R2_HOST = 'b5e7e1a05c372b1342ba6a35286bd4fb.r2.cloudflarestorage.com';
const BUCKET = 'wanwan-guestbook-media';
const b64 = value => Buffer.from(value).toString('base64url');
const unb64 = value => Buffer.from(value, 'base64url').toString();
const sign = value => crypto.createHmac('sha256', process.env.WANWAN_SESSION_SECRET).update(value).digest('base64url');
function timingEqual(a,b){return a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));}
function session(payload){const body=b64(JSON.stringify(payload));return `${body}.${sign(body)}`;}
function readSession(req){const token=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('wanwan_upload_session='))?.split('=').slice(1).join('=');if(!token)return null;const [body,signature]=token.split('.');if(!body||!signature||!timingEqual(signature,sign(body)))return null;try{const data=JSON.parse(unb64(body));return data.exp>Date.now()?data:null}catch{return null}}
function hmac(key,data,encoding){return crypto.createHmac('sha256',key).update(data).digest(encoding)}
function sha(data){return crypto.createHash('sha256').update(data).digest('hex')}
function r2UploadUrl(key, contentType){
  const now=new Date();const stamp=now.toISOString().replace(/[:-]|\.\d{3}/g,'');const day=stamp.slice(0,8);const method='PUT';
  const objectPath=`/${BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const credentialScope=`${day}/auto/s3/aws4_request`;const query=new URLSearchParams({
    'X-Amz-Algorithm':'AWS4-HMAC-SHA256','X-Amz-Credential':`${process.env.R2_ACCESS_KEY_ID}/${credentialScope}`,'X-Amz-Date':stamp,'X-Amz-Expires':'900','X-Amz-SignedHeaders':'host'
  });
  const canonical=`${method}\n${objectPath}\n${query.toString()}\nhost:${R2_HOST}\n\nhost\nUNSIGNED-PAYLOAD`;
  const stringToSign=`AWS4-HMAC-SHA256\n${stamp}\n${credentialScope}\n${sha(canonical)}`;
  const kDate=hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`,day);const kRegion=hmac(kDate,'auto');const kService=hmac(kRegion,'s3');const kSigning=hmac(kService,'aws4_request');
  query.set('X-Amz-Signature',hmac(kSigning,stringToSign,'hex'));
  return `https://${R2_HOST}${objectPath}?${query.toString()}`;
}
module.exports={BUCKET,session,readSession,r2UploadUrl};
