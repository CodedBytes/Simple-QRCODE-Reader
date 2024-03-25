# Simple QRCODE Reader

Este é um projeto simples para leitura de qualqer tipo de QR CODE gerado por você ou em algum website / grafica,
apenas como uma base para algum projeto.
Eu estarei mudando graficamente a forma como o leitor se comporta para se ajustar as minhas necessidades.

A API / Middleware usada aqui foi a [HTML5-QRCode](https://blog.minhazav.dev/research/html5-qrcode) , 
estarei deixando o [github](https://github.com/mebjas/html5-qrcode) dele como referencia.

Usei um gerador generico de certificados para poder rodar o html5-qrcode no localhost, você consegue gerar esses certificados genericos pela internet
com fins apenas para testes locais, ja que eles são invalidos e o proprio navegador os reconhece como invalidos também.
Estou usando o node.js aqui mas você pode usar qualquer tipo de HTTP Server e configurar o certificado tudo bonitinho.

Estou deixando um certificado que criei, com 5 anos de duração então testem a vontade.

Projeto sob licensa MIT, todas as mudanças são de minha autoria. Para saber mais, por favor refira-se ao arquivo LICENSE dentro do repositorio! 
