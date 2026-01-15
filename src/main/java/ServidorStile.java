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
        String portStr = System.getenv("PORT");
        int port = (portStr != null) ? Integer.parseInt(portStr) : 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(port);

        System.out.println("🚀 STILE STUDIO ONLINE NA PORTA: " + port);

        // --- ROTA 1: GERAR COLEÇÃO COMPLETA (ZIP) ---
        app.post("/gerar-arte", ctx -> {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            try {
                String apiKey = ctx.formParam("api_key");
                List<UploadedFile> fotos = ctx.uploadedFiles("fotos");
                List<String> precosDe = ctx.formParams("precos_de");
                List<String> precosPor = ctx.formParams("precos_por");

                for (int i = 0; i < fotos.size(); i++) {
                    UploadedFile foto = fotos.get(i);
                    String cod = foto.filename().toUpperCase().replaceAll("\\.(JPG|PNG|JPEG|jpg|png|jpeg)", "");

                    File tempIn = File.createTempFile("stile_raw", ".jpg");
                    Files.copy(foto.content(), tempIn.toPath(), StandardCopyOption.REPLACE_EXISTING);

                    File noBg = File.createTempFile("stile_nobg", ".png");
                    removerFundo(tempIn, noBg, apiKey);

                    // Implementação do design atualizado
                    BufferedImage arte = desenharStory(noBg, precosDe.get(i), precosPor.get(i), cod, i + 1);

                    zos.putNextEntry(new ZipEntry("STORY_" + cod + ".png"));
                    ImageIO.write(arte, "png", zos);
                    zos.closeEntry();

                    tempIn.delete();
                    noBg.delete();
                }

                zos.finish();
                zos.close();

                ctx.contentType("application/octet-stream");
                ctx.header("Content-Disposition", "attachment; filename=\"pack_stile.zip\"");
                ctx.result(new ByteArrayInputStream(baos.toByteArray()));

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro: " + e.getMessage());
            }
        });

        // --- ROTA 2: GERAR IMAGEM INDIVIDUAL (PNG) ---
        app.post("/gerar-imagem", ctx -> {
            try {
                String apiKey = ctx.formParam("api_key");
                UploadedFile foto = ctx.uploadedFile("foto");
                String precoDe = ctx.formParam("preco_de");
                String precoPor = ctx.formParam("preco_por");
                String cod = foto.filename().toUpperCase().replaceAll("\\.(JPG|PNG|JPEG|jpg|png|jpeg)", "");

                File tempIn = File.createTempFile("stile_single", ".jpg");
                Files.copy(foto.content(), tempIn.toPath(), StandardCopyOption.REPLACE_EXISTING);

                File noBg = File.createTempFile("stile_nobg_single", ".png");
                removerFundo(tempIn, noBg, apiKey);

                BufferedImage arte = desenharStory(noBg, precoDe, precoPor, cod, 1);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(arte, "png", baos);

                tempIn.delete();
                noBg.delete();

                ctx.contentType("image/png");
                ctx.result(baos.toByteArray());

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro: " + e.getMessage());
            }
        });
    }

    // --- LÓGICA DE DESIGN IMPLEMENTADA DO SEU CÓDIGO DESKTOP ---
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

        // Fundo Branco/Cinza claro
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        // 1. Topo: PEÇA O LINK
        g.setFont(ultra.deriveFont(26f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "PEÇA O LINK NOS COMENTÁRIOS", w, 120);

        // 2. Código do Produto
        g.setFont(ultra.deriveFont(85f));
        g.setColor(roxo);
        centralizar(g, codigo.toUpperCase(), w, 250);

        // 3. Número da Peça
        g.setFont(ultra.deriveFont(110f));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, String.format("%02d", num), w, 390);

        // 4. Imagem do Produto centralizada
        try {
            BufferedImage prod = ImageIO.read(imgPng);
            if (prod != null) {
                int pW = 850;
                int pH = (prod.getHeight() * pW) / prod.getWidth();
                // Cálculo de Y para manter o produto entre o código e o preço
                int yImg = 390 + 40 + (((1480 - 80) - (390 + 40)) / 2) - (pH / 2);
                g.drawImage(prod, (w - pW) / 2, yImg, pW, pH, null);
            }
        } catch (Exception e) {}

        // 5. Preço DE (Com o risco branco)
        g.setFont(ultra.deriveFont(114f));
        g.setColor(roxo50);
        String textoDe = "R$" + de;
        centralizar(g, textoDe, w, 1480);

        // Linha branca para riscar o preço
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(18));
        FontMetrics fm = g.getFontMetrics(ultra.deriveFont(114f));
        int larguraDe = fm.stringWidth(textoDe);
        g.drawLine((w/2) - (larguraDe/2) - 20, 1480 - 45, (w/2) + (larguraDe/2) + 20, 1480 - 45);

        // 6. Preço POR
        g.setFont(ultra.deriveFont(145f));
        g.setColor(roxo);
        centralizar(g, "R$" + por, w, 1660);

        // 7. Rodapé
        g.setFont(ultra.deriveFont(32f));
        g.setColor(new Color(100, 100, 100));
        centralizar(g, "COM VARIAÇÃO DE CORES", w, 1760);
        centralizar(g, "@STILE_", w, 1870);

        g.dispose();
        return story;
    }

    private static void removerFundo(File in, File out, String key) {
        try {
            URL url = new URL("https://api.remove.bg/v1.0/removebg");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("X-Api-Key", key);
            String b = "---" + System.currentTimeMillis();
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + b);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(("--" + b + "\r\n").getBytes());
                os.write("Content-Disposition: form-data; name=\"image_file\"; filename=\"i.jpg\"\r\n\r\n".getBytes());
                Files.copy(in.toPath(), os);
                os.write(("\r\n--" + b + "--\r\n").getBytes());
            }
            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) { Files.copy(is, out.toPath(), StandardCopyOption.REPLACE_EXISTING); }
            } else { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); }
        } catch (Exception e) {
            try { Files.copy(in.toPath(), out.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception ignore) {}
        }
    }

    private static Font carregarFonte(String path, float size) {
        try {
            File fontFile = new File(path);
            if(fontFile.exists()){
                return Font.createFont(Font.TRUETYPE_FONT, fontFile).deriveFont(size);
            }
        } catch (Exception e) { }
        return new Font("Arial", Font.BOLD, (int)size);
    }

    private static void centralizar(Graphics2D g, String t, int w, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(t, (w - fm.stringWidth(t)) / 2, y);
    }
}