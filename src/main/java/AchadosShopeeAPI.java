import io.javalin.Javalin;
import io.javalin.http.UploadedFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class AchadosShopeeAPI {

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(8080);

        System.out.println("🚀 API STILE rodando na porta 8080");

        // ROTA CORRIGIDA PARA "/gerar-imagem" (Igual ao seu React)
        app.post("/gerar-imagem", ctx -> {

            // NOMES DOS CAMPOS SINCRONIZADOS COM O REACT:
            UploadedFile imgFile = ctx.uploadedFile("foto"); // React envia 'foto'
            String apiKey = ctx.formParam("api_key");
            String textoTopo = ctx.formParam("texto_topo");
            String codigo = ctx.formParam("codigo");
            String numero = ctx.formParam("numero");
            String precoDe = ctx.formParam("preco_de");
            String precoPor = ctx.formParam("preco_por");
            String variacao = ctx.formParam("texto_variacao");
            String instagram = ctx.formParam("instagram");

            if (imgFile == null) {
                ctx.status(400).result("Imagem obrigatória");
                return;
            }

            // Lógica de remoção de fundo
            InputStream imagemParaProcessar;
            if (apiKey != null && !apiKey.isBlank()) {
                byte[] imgBytes = imgFile.content().readAllBytes();
                imagemParaProcessar = removerFundo(imgBytes, apiKey);
            } else {
                imagemParaProcessar = imgFile.content();
            }

            BufferedImage personagem = ImageIO.read(imagemParaProcessar);

            // Chamada do gerador usando as variáveis que vieram do formulário
            BufferedImage resultado = gerarImagem(
                    textoTopo, codigo, "Nº " + numero, variacao, instagram, personagem
            );

            ctx.contentType("image/png");
            ImageIO.write(resultado, "png", ctx.outputStream());
        });
    }

    private static InputStream removerFundo(byte[] imgBytes, String apiKey) {
        try {
            URL url = new URL("https://api.remove.bg/v1.0/removebg");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-Api-Key", apiKey);

            String boundary = Long.toHexString(System.currentTimeMillis());
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream out = conn.getOutputStream();
                 PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true)) {

                writer.println("--" + boundary);
                writer.println("Content-Disposition: form-data; name=\"image_file\"; filename=\"foto.png\"");
                writer.println("Content-Type: image/png");
                writer.println();
                out.write(imgBytes);
                writer.println();
                writer.println("--" + boundary + "--");
            }

            if (conn.getResponseCode() == 200) {
                return conn.getInputStream();
            } else {
                System.out.println("Erro na API Remove.bg: " + conn.getResponseCode());
                return new ByteArrayInputStream(imgBytes);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ByteArrayInputStream(imgBytes);
        }
    }

    private static BufferedImage gerarImagem(
            String topo, String cod, String num, String var, String insta, BufferedImage personagem
    ) throws Exception {
        int w = 1080, h = 1920;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, h);

        Color roxo = new Color(145, 130, 213);
        Font ultra = carregarFonte("Ultra-Regular.ttf", 100);

        // Topo
        g.setFont(ultra.deriveFont(50f));
        g.setColor(new Color(90, 90, 90));
        centralizar(g, topo != null ? topo : "", w, 160);

        // Código
        g.setFont(ultra.deriveFont(180f));
        g.setColor(roxo);
        centralizar(g, cod != null ? cod : "", w, 380);

        // Variação/Sub
        g.setFont(ultra.deriveFont(30f));
        g.setColor(new Color(120, 120, 120));
        centralizar(g, var != null ? var : "", w, 440);

        // Número
        g.setFont(ultra.deriveFont(40f));
        g.setColor(roxo);
        centralizar(g, num != null ? num : "", w, 500);

        // Personagem
        if (personagem != null) {
            int pw = 850;
            int ph = personagem.getHeight() * pw / personagem.getWidth();
            g.drawImage(personagem, (w - pw) / 2, 600, pw, ph, null);
        }

        // Rodapé
        g.setFont(ultra.deriveFont(35f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, insta != null ? insta : "", w, 1860);

        g.dispose();
        return img;
    }

    private static Font carregarFonte(String nomeArquivo, float size) {
        try {
            return Font.createFont(Font.TRUETYPE_FONT, new File(nomeArquivo)).deriveFont(size);
        } catch (Exception e) {
            return new Font("Arial", Font.BOLD, (int) size);
        }
    }

    private static void centralizar(Graphics2D g, String texto, int largura, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(texto, (largura - fm.stringWidth(texto)) / 2, y);
    }
}