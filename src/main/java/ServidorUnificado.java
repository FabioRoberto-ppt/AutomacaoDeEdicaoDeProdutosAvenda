import io.javalin.Javalin;
import io.javalin.http.UploadedFile;
import io.javalin.http.staticfiles.Location;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class ServidorUnificado {

    public static void main(String[] args) {
        int port = 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));

            // CONFIGURAÇÃO DOS ARQUIVOS ESTÁTICOS
            config.staticFiles.add(staticFiles -> {
                staticFiles.hostedPath = "/";
                staticFiles.directory = "/public";
                staticFiles.location = Location.CLASSPATH;
            });
        }).start(port);

        System.out.println("🚀 SERVIDOR UNIFICADO ATUALIZADO: http://localhost:" + port);

        // ================= ROTA 1: STILE (PRODUTOS) =================
        app.post("/gerar-story", ctx -> {
            try {
                String apiKey = ctx.formParam("api_key");
                UploadedFile file = ctx.uploadedFile("foto");
                String precoDe = ctx.formParam("preco_de");
                String precoPor = ctx.formParam("preco_por");
                String codigo = ctx.formParam("codigo");
                String marca = ctx.formParam("marca");

                File in = File.createTempFile("raw_", ".png");
                Files.copy(file.content(), in.toPath(), StandardCopyOption.REPLACE_EXISTING);

                File nobg = File.createTempFile("nobg_", ".png");
                removerFundo(in, nobg, apiKey);

                BufferedImage arte = desenharStoryStile(nobg, precoDe, precoPor, codigo, marca);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(arte, "png", baos);

                in.delete(); nobg.delete();
                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro no Story: " + e.getMessage());
            }
        });

        // ================= ROTA 2: SHOPEE (CAPAS COM SUBTÍTULO E RODAPÉ) =================
        app.post("/gerar-capa", ctx -> {
            try {
                UploadedFile imgFile = ctx.uploadedFile("imagem");
                String achados = ctx.formParam("achados");     // Texto topo
                String titulo = ctx.formParam("titulo");       // Título principal
                String subtitulo = ctx.formParam("subtitulo"); // Texto abaixo do título
                String usuario = ctx.formParam("usuario");     // @ Nome no rodapé

                // >>> NOVO
                String parte = ctx.formParam("parte");
                if (parte == null || parte.isBlank()) {
                    parte = "1";
                }

                BufferedImage personagem = ImageIO.read(imgFile.content());
                BufferedImage resultado = gerarCapaShopee(achados, titulo, subtitulo, usuario, parte, personagem);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(resultado, "png", baos);
                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro na Capa: " + e.getMessage());
            }
        });

        // ================= ROTA 3: FECHAMENTO DE VÍDEO =================
        app.post("/gerar-fechamento", ctx -> {
            try {
                String tipo = ctx.formParam("tipo");
                String insta = ctx.formParam("insta");

                // No fechamento, o fundo é sólido roxo
                BufferedImage resultado = desenharFechamento(tipo, insta);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(resultado, "png", baos);
                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro no Fechamento: " + e.getMessage());
            }
        });
    }

    // ================= LÓGICA DE DESENHO: CAPA (ESTILO REFERÊNCIA) =================
    private static BufferedImage gerarCapaShopee(String topo, String titulo, String sub, String user, String parte, BufferedImage img) throws Exception {
        int w = 1080, h = 1920;
        BufferedImage canvas = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = canvas.createGraphics();
        configurarRenderizacao(g);

        // Fundo Cinza Claro (Referência)
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte("/Ultra-Regular.ttf", 80);
        Color roxo = new Color(145, 130, 213);
        Color cinzaEscuro = new Color(80, 80, 80);

        // >>> NOVO: PARTE
        if (parte == null || parte.isBlank()) {
            parte = "1";
        }
        g.setFont(ultra.deriveFont(48f));
        g.setColor(roxo);
        g.drawString("PARTE " + parte, 50, 110);

        // 1. Texto Topo
        centralizar(g, topo.toUpperCase(), ultra.deriveFont(65f), cinzaEscuro, w, 220);

        // 2. Título (Grande e Roxo)
        centralizar(g, titulo.toLowerCase(), ultra.deriveFont(280f), roxo, w, 480);

        // 3. Subtítulo (Logo abaixo do título)
        centralizar(g, sub.toUpperCase(), ultra.deriveFont(38f), cinzaEscuro, w, 550);

        // 4. Imagem do Produto/Personagem
        if (img != null) {
            double scale = Math.min(850.0 / img.getWidth(), 1000.0 / img.getHeight());
            int pW = (int) (img.getWidth() * scale);
            int pH = (int) (img.getHeight() * scale);
            g.drawImage(img, (w - pW) / 2, 650, pW, pH, null);
        }

        // 5. Rodapé (Usuário)
        centralizar(g, user.toLowerCase(), ultra.deriveFont(45f), cinzaEscuro, w, 1780);

        g.dispose();
        return canvas;
    }

    // ================= LÓGICA DE DESENHO: FECHAMENTO =================
    private static BufferedImage desenharFechamento(String tipo, String insta) {
        int w = 1080, h = 1920;
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        configurarRenderizacao(g);

        g.setColor(new Color(145, 130, 213)); // Roxo Assinatura
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte("/Ultra-Regular.ttf", 90);
        g.setColor(Color.WHITE);

        if ("AGRADECIMENTO".equals(tipo)) {
            centralizar(g, "OBRIGADO PELA", ultra.deriveFont(85f), Color.WHITE, w, 850);
            centralizar(g, "CONFIANÇA!", ultra.deriveFont(115f), Color.WHITE, w, 1000);
        } else {
            centralizar(g, "LINK DESTA PEÇA", ultra.deriveFont(80f), Color.WHITE, w, 850);
            centralizar(g, "ESTÁ NA BIO!", ultra.deriveFont(105f), Color.WHITE, w, 1000);
        }

        centralizar(g, "@" + insta.toLowerCase().replace("@", ""), ultra.deriveFont(45f), new Color(255,255,255, 180), w, 1800);

        g.dispose();
        return img;
    }

    // ================= LÓGICA DE DESENHO: STORY PRODUTO =================
    private static BufferedImage desenharStoryStile(File imgPng, String de, String por, String codigo, String marca) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage story = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = story.createGraphics();
        configurarRenderizacao(g);

        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte("/Ultra-Regular.ttf", 100);
        Color roxo = new Color(145, 130, 213);

        centralizar(g, "PEÇA O LINK NOS COMENTÁRIOS", ultra.deriveFont(26f), new Color(100, 100, 100), w, 120);
        centralizar(g, codigo.toUpperCase(), ultra.deriveFont(85f), roxo, w, 250);

        BufferedImage prod = ImageIO.read(imgPng);
        if (prod != null) {
            double scale = Math.min(850.0 / prod.getWidth(), 900.0 / prod.getHeight());
            int pW = (int) (prod.getWidth() * scale);
            int pH = (int) (prod.getHeight() * scale);
            g.drawImage(prod, (w - pW) / 2, 450 + (950 - pH) / 2, pW, pH, null);
        }

        centralizar(g, "R$" + por, ultra.deriveFont(150f), roxo, w, 1660);
        g.dispose();
        return story;
    }

    // ================= UTILITÁRIOS =================
    private static void removerFundo(File in, File out, String key) {
        try {
            if (key == null || key.isBlank()) { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); return; }
            URL url = new URL("https://api.remove.bg/v1.0/removebg");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-Api-Key", key);
            conn.setDoOutput(true);
            String boundary = "---" + System.currentTimeMillis();
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(("--" + boundary + "\r\n").getBytes());
                os.write("Content-Disposition: form-data; name=\"image_file\"; filename=\"f.png\"\r\n\r\n".getBytes());
                Files.copy(in.toPath(), os);
                os.write(("\r\n--" + boundary + "--\r\n").getBytes());
            }
            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) { Files.copy(is, out.toPath(), StandardCopyOption.REPLACE_EXISTING); }
            } else { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); }
        } catch (Exception e) {
            try { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception ignored) {}
        }
    }

    private static void configurarRenderizacao(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    }

    private static Font carregarFonte(String caminho, float size) {
        try {
            InputStream is = ServidorUnificado.class.getResourceAsStream(caminho);
            if (is == null) throw new RuntimeException("Fonte não encontrada: " + caminho);
            return Font.createFont(Font.TRUETYPE_FONT, is).deriveFont(size);
        } catch (Exception e) {
            return new Font("Arial", Font.BOLD, (int) size);
        }
    }

    private static void centralizar(Graphics2D g, String texto, Font font, Color cor, int largura, int y) {
        g.setFont(font);
        g.setColor(cor);
        FontMetrics fm = g.getFontMetrics();
        g.drawString(texto, (largura - fm.stringWidth(texto)) / 2, y);
    }
}
