import io.javalin.Javalin;
import io.javalin.http.UploadedFile;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ServidorStile {

    public static void main(String[] args) {
        // Porta dinâmica para o Render
        String portStr = System.getenv("PORT");
        int port = (portStr != null) ? Integer.parseInt(portStr) : 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(port);

        System.out.println("🚀 SERVIDOR STILE ATIVO NA PORTA: " + port);

        // --- ROTA 1: GERAR IMAGEM INDIVIDUAL (PNG) ---
        app.post("/gerar-imagem", ctx -> {
            try {
                String apiKey = ctx.formParam("api_key");
                UploadedFile file = ctx.uploadedFile("foto");
                String precoDe = ctx.formParam("preco_de");
                String precoPor = ctx.formParam("preco_por");

                if (file == null) {
                    ctx.status(400).result("Nenhum arquivo enviado.");
                    return;
                }

                // Arquivos temporários
                File tempIn = File.createTempFile("raw_", ".png");
                try (InputStream is = file.content()) {
                    Files.copy(is, tempIn.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }

                File noBg = File.createTempFile("nobg_", ".png");

                // CHAMA A REMOÇÃO DE FUNDO CORRIGIDA
                removerFundo(tempIn, noBg, apiKey);

                String cod = file.filename().toUpperCase().replaceAll("\\.(JPG|PNG|JPEG|jpg|png|jpeg)", "");
                BufferedImage arte = desenharStory(noBg, precoDe, precoPor, cod, 1);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(arte, "png", baos);

                tempIn.delete();
                noBg.delete();

                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro no processamento: " + e.getMessage());
            }
        });

        // --- ROTA 2: GERAR COLEÇÃO (ZIP) ---
        app.post("/gerar-arte", ctx -> {
            try {
                String apiKey = ctx.formParam("api_key");
                List<UploadedFile> fotos = ctx.uploadedFiles("fotos");
                List<String> precosDe = ctx.formParams("precos_de");
                List<String> precosPor = ctx.formParams("precos_por");

                ByteArrayOutputStream zipBaos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(zipBaos);

                for (int i = 0; i < fotos.size(); i++) {
                    UploadedFile foto = fotos.get(i);
                    String cod = foto.filename().toUpperCase().replaceAll("\\.(JPG|PNG|JPEG|jpg|png|jpeg)", "");

                    File tIn = File.createTempFile("zraw_", ".png");
                    try (InputStream is = foto.content()) {
                        Files.copy(is, tIn.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    }

                    File tNoBg = File.createTempFile("znobg_", ".png");
                    removerFundo(tIn, tNoBg, apiKey);

                    BufferedImage arte = desenharStory(tNoBg, precosDe.get(i), precosPor.get(i), cod, i + 1);

                    zos.putNextEntry(new ZipEntry("STORY_" + cod + ".png"));
                    ImageIO.write(arte, "png", zos);
                    zos.closeEntry();

                    tIn.delete(); tNoBg.delete();
                }

                zos.finish();
                zos.close();
                ctx.contentType("application/zip").result(zipBaos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro no ZIP: " + e.getMessage());
            }
        });
    }

    // --- LÓGICA DE DESIGN (STREETWEAR) ---
    private static BufferedImage desenharStory(File imgPng, String de, String por, String codigo, int num) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage story = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = story.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Cores e Fonte
        Color roxo = new Color(145, 130, 213);
        Color roxo50 = new Color(145, 130, 213, 128);
        Font ultra = carregarFonte(".ttf/Ultra-Regular.ttf", 100);

        // Fundo
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        // Topo e Código
        g.setFont(ultra.deriveFont(26f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "PEÇA O LINK NOS COMENTÁRIOS", w, 120);

        g.setFont(ultra.deriveFont(85f));
        g.setColor(roxo);
        centralizar(g, codigo, w, 250);

        g.setFont(ultra.deriveFont(110f));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, String.format("%02d", num), w, 390);

        // Imagem do Produto
        try {
            BufferedImage prod = ImageIO.read(imgPng);
            if (prod != null) {
                int pW = 850;
                int pH = (prod.getHeight() * pW) / prod.getWidth();
                int yImg = 390 + 40 + (((1480 - 80) - (390 + 40)) / 2) - (pH / 2);
                g.drawImage(prod, (w - pW) / 2, yImg, pW, pH, null);
            }
        } catch (Exception e) {}

        // Preço DE
        g.setFont(ultra.deriveFont(114f));
        g.setColor(roxo50);
        String txtDe = "R$" + (de != null ? de : "00,00");
        centralizar(g, txtDe, w, 1480);

        // Risco Branco no Preço DE
        FontMetrics fm = g.getFontMetrics();
        int largDe = fm.stringWidth(txtDe);
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(18));
        g.drawLine((w - largDe)/2 - 20, 1480 - 45, (w + largDe)/2 + 20, 1480 - 45);

        // Preço POR
        g.setFont(ultra.deriveFont(145f));
        g.setColor(roxo);
        centralizar(g, "R$" + (por != null ? por : "00,00"), w, 1660);

        // Rodapé
        g.setFont(ultra.deriveFont(32f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "COM VARIAÇÃO DE CORES", w, 1760);
        centralizar(g, "@STILE_", w, 1870);

        g.dispose();
        return story;
    }

    // --- FUNÇÃO DE REMOVER FUNDO (CORRIGIDA PARA API) ---
    private static void removerFundo(File in, File out, String key) {
        try {
            if (key == null || key.isEmpty()) {
                Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING);
                return;
            }

            URL url = new URL("https://api.remove.bg/v1.0/removebg");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("X-Api-Key", key);

            String boundary = "---" + System.currentTimeMillis();
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream os = conn.getOutputStream()) {
                PrintWriter writer = new PrintWriter(new OutputStreamWriter(os, "UTF-8"), true);

                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"image_file\"; filename=\"f.png\"").append("\r\n");
                writer.append("Content-Type: image/png").append("\r\n\r\n");
                writer.flush();

                Files.copy(in.toPath(), os);
                os.flush();

                writer.append("\r\n").append("--" + boundary + "--").append("\r\n");
                writer.flush();
            }

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    Files.copy(is, out.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            } else {
                // Se der erro na API, apenas copia a original para não travar
                Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            try { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception ignored) {}
        }
    }

    private static Font carregarFonte(String p, float s) {
        try {
            File f = new File(p);
            if (f.exists()) return Font.createFont(Font.TRUETYPE_FONT, f).deriveFont(s);
        } catch (Exception e) {}
        return new Font("Arial", Font.BOLD, (int)s);
    }

    private static void centralizar(Graphics2D g, String t, int w, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(t, (w - fm.stringWidth(t)) / 2, y);
    }
}