const Constants = require('./scripts/constants')

const renderEmailSig = (userEmail = '') => {
  let { Name, Email, Phone, Address, ShowEndNote } =
    Constants.SigData[userEmail] || Constants.SigData['DEFAULT']
  return `<TABLE cellSpacing="0" cellPadding="0" border="0" style="FONT-FAMILY: Arial, sans-serif; COLOR: #000000 ;max-width:500px;">
  <TBODY>
    <TR>
      <TD width="170" style="FONT-SIZE: 10pt; FONT-FAMILY: Arial, sans-serif; COLOR: #000000; line-height:12pt; padding-bottom:10px; padding-right:20px; text-align:center; width:170px" vAlign="top" align="center">
  
        <p style="margin-bottom:40px">
          <img border="0" src="" width="124" style="max-width:124px; height:auto; border:0;">
          <br><br>
        </p>
      </TD>
      <TD vAlign="top">
        <div style='border-left: 2px solid black; height: 200px; margin-right: 20px;'></div>
      </TD>
  
      <TD vAlign="top" style="FONT-FAMILY: Arial, sans-serif; padding-bottom:10px">
        <SPAN style="FONT-SIZE: 20pt; COLOR: #000000; FONT-FAMILY: Arial, sans-serif;"><STRONG>${Name}</STRONG></SPAN>
        <span style="FONT-SIZE: 12pt; COLOR: #000000;"><BR>▪︎ Business Manager</span>
        <BR><BR>
  
        <span style="FONT-SIZE: 9pt"><img src="" border="0" style="border:0; height:14px; width:14px" />&nbsp; ${Phone}</span>
        <BR>
        <span style="FONT-SIZE: 9pt"><img src="" border="0" style="border:0; height:14px; width:14px" />&nbsp; ${Email}</span>
        <br>
        <span style="FONT-SIZE: 9pt"><img src="" border="0" style="border:0; height:14px; width:14px" />&nbsp; ${Address}<BR></span>
        <img src="" border="0" style="border:0; height:14px; width:14px" />&nbsp;
        <a href="" target="_blank" rel="noopener" style=" text-decoration:none;"><strong style="color:#000000; font-family:Arial, sans-serif; font-size:9pt"></strong></a>
        <BR>
        ${
          ShowEndNote
            ? `<span style="FONT-SIZE: 7pt">*Veuillez note que tout mes courriel sont répondu le matin entre 7-9 heure pour une urgence appeler mon cellulaire merci
        <BR></span>`
            : ''
        }
      </TD>
    </TR>
  </TBODY>
  </TABLE>`
}

module.exports = renderEmailSig
