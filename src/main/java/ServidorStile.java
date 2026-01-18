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
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ServidorStile {

    public static void main(String[] args) {
        int port = System.getenv("PORT") != null ? Integer.parseInt(System.getenv("PORT")) : 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
            config.staticFiles.add("/public", Location.CLASSPATH);
        }).start(port);

        System.out.println("🚀 SERVIDOR STILE ATIVO: http://localhost:" + port);

        app.post("/gerar-imagem", ctx -> {
            try {
                String apiKey = ctx.formParam("api_key");
                UploadedFile file = ctx.uploadedFile("foto");
                String precoDe = ctx.formParam("preco_de");
                String precoPor = ctx.formParam("preco_por");
                String codigo = ctx.formParam("codigo");
                String marca = ctx.formParam("marca");
                int numero = Integer.parseInt(ctx.formParam("numero"));

                File in = File.createTempFile("raw_", ".png");
                Files.copy(file.content(), in.toPath(), StandardCopyOption.REPLACE_EXISTING);

                File nobg = File.createTempFile("nobg_", ".png");
                removerFundo(in, nobg, apiKey);

                BufferedImage arte = desenharStory(nobg, precoDe, precoPor, codigo, numero, marca);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(arte, "png", baos);

                in.delete(); nobg.delete();
                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro: " + e.getMessage());
            }
        });

        app.post("/gerar-arte", ctx -> {
            try {
                List<UploadedFile> fotos = ctx.uploadedFiles("fotos");
                List<String> precosDe = ctx.formParams("precos_de");
                List<String> precosPor = ctx.formParams("precos_por");
                List<String> codigos = ctx.formParams("codigos");
                List<String> marcas = ctx.formParams("marcas");
                List<String> numeros = ctx.formParams("numeros");
                String apiKey = ctx.formParam("api_key");

                ByteArrayOutputStream zipBaos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(zipBaos);

                for (int i = 0; i < fotos.size(); i++) {
                    File in = File.createTempFile("zraw_", ".png");
                    Files.copy(fotos.get(i).content(), in.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    File nobg = File.createTempFile("znobg_", ".png");
                    removerFundo(in, nobg, apiKey);

                    BufferedImage arte = desenharStory(
                            nobg, precosDe.get(i), precosPor.get(i),
                            codigos.get(i), Integer.parseInt(numeros.get(i)), marcas.get(i)
                    );

                    zos.putNextEntry(new ZipEntry("STORY_" + codigos.get(i).toUpperCase() + ".png"));
                    ImageIO.write(arte, "png", zos);
                    zos.closeEntry();
                    in.delete(); nobg.delete();
                }
                zos.finish(); zos.close();
                ctx.contentType("application/zip").result(zipBaos.toByteArray());
            } catch (Exception e) {
                ctx.status(500).result("Erro ZIP: " + e.getMessage());
            }
        });
    }

    private static BufferedImage desenharStory(File imgPng, String de, String por, String codigo, int num, String marca) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage story = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = story.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);

        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte("/public/.ttf/Ultra-Regular.ttf", 100);
        Color roxo = new Color(145, 130, 213);
        Color roxo50 = new Color(145, 130, 213, 128);
        Color cinzaTextos = new Color(100, 100, 100); // MESMA COR PARA OS TEXTOS CINZAS

        // 1. Topo
        g.setFont(ultra.deriveFont(26f));
        g.setColor(cinzaTextos);
        centralizar(g, "PEÇA O LINK NOS COMENTÁRIOS ", w, 120);

        // 2. Código
        g.setFont(ultra.deriveFont(85f));
        g.setColor(roxo);
        centralizar(g, codigo.toUpperCase(), w, 250);

        // 3. Número
        g.setFont(ultra.deriveFont(110f));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, String.format("%02d", num), w, 390);

        // 4. Produto
        try {
            BufferedImage prod = ImageIO.read(imgPng);
            if (prod != null) {
                double scale = Math.min(850.0 / prod.getWidth(), 900.0 / prod.getHeight());
                int pW = (int) (prod.getWidth() * scale);
                int pH = (int) (prod.getHeight() * scale);
                int xImg = (w - pW) / 2;
                int yImg = 450 + (950 - pH) / 2;
                g.drawImage(prod, xImg, yImg, pW, pH, null);
            }
        } catch (Exception e) {}

        // 5. Preço DE
        g.setFont(ultra.deriveFont(114f));
        g.setColor(roxo50);
        String txtDe = "R$" + (de.isEmpty() ? "00,00" : de);
        centralizar(g, txtDe, w, 1480);

        FontMetrics fm = g.getFontMetrics();
        int tw = fm.stringWidth(txtDe);
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(15));
        g.drawLine((w - tw) / 2 - 10, 1435, (w + tw) / 2 + 10, 1435);

        // 6. Preço POR
        g.setFont(ultra.deriveFont(150f));
        g.setColor(roxo);
        centralizar(g, "R$" + (por.isEmpty() ? "00,00" : por), w, 1660);

        // 7. Rodapé (MARCA COM A MESMA COR CINZA)
        g.setFont(ultra.deriveFont(32f));
        g.setColor(cinzaTextos);
        centralizar(g, "COM VARIAÇÃO DE CORES", w, 1760);

        g.setFont(ultra.deriveFont(32f));
        g.setColor(cinzaTextos); // AQUI GARANTE A MESMA COR
        centralizar(g, "@" + marca.replace("@", "").toUpperCase(), w, 1870);

        g.dispose();
        return story;
    }

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
        } catch (Exception e) { try { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception ignored) {} }
    }

    private static Font carregarFonte(String path, float size) {
        try (InputStream is = ServidorStile.class.getResourceAsStream(path)) {
            if (is != null) return Font.createFont(Font.TRUETYPE_FONT, is).deriveFont(size);
        } catch (Exception e) { System.out.println("Erro fonte: " + e.getMessage()); }
        return new Font("Arial", Font.BOLD, (int) size);
    }

    private static void centralizar(Graphics2D g, String t, int w, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(t, (w - fm.stringWidth(t)) / 2, y);
    }
}