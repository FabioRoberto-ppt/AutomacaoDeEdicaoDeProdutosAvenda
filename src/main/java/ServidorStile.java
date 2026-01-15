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
        // ADICIONADO PARA O RENDER: Captura a porta do ambiente
        String portStr = System.getenv("PORT");
        int port = (portStr != null) ? Integer.parseInt(portStr) : 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(port);

        System.out.println("🚀 STILE STUDIO ONLINE NA PORTA: " + port);

        app.post("/gerar-arte", ctx -> {
            // ADICIONADO PARA O RENDER: Processamento direto em RAM (ByteArray)
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

                    // Arquivos temporários permitidos pelo Render em /tmp
                    File tempIn = File.createTempFile("stile_raw", ".jpg");
                    Files.copy(foto.content(), tempIn.toPath(), StandardCopyOption.REPLACE_EXISTING);

                    File noBg = File.createTempFile("stile_nobg", ".png");
                    removerFundo(tempIn, noBg, apiKey);

                    // FUNÇÃO DE DESENHO ORIGINAL (MANTIDA INTEGRALMENTE)
                    BufferedImage arte = desenharStory(noBg, precosDe.get(i), precosPor.get(i), cod, i + 1);

                    // Transforma a imagem em bytes para injetar no ZIP em memória
                    ByteArrayOutputStream imageBytes = new ByteArrayOutputStream();
                    ImageIO.write(arte, "png", imageBytes);

                    zos.putNextEntry(new ZipEntry("STILE_" + (i + 1) + "_" + cod + ".png"));
                    zos.write(imageBytes.toByteArray());
                    zos.closeEntry();

                    // Limpeza de rastros temporários
                    tempIn.delete();
                    noBg.delete();
                }

                zos.finish();
                zos.close();

                // Retorna o arquivo ZIP gerado
                ctx.contentType("application/octet-stream");
                ctx.header("Content-Disposition", "attachment; filename=\"pack_stile.zip\"");
                ctx.result(new ByteArrayInputStream(baos.toByteArray()));

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro no Studio: " + e.getMessage());
            }
        });
    }

    // --- MANTENDO TODAS AS FUNÇÕES ORIGINAIS ABAIXO ---

    private static BufferedImage desenharStory(File imgPng, String de, String por, String cod, int num) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage canvas = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = canvas.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // 1. FUNDO CINZA STUDIO
        g.setColor(new Color(240, 240, 240));
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte(".ttf/Ultra-Regular.ttf", 100);
        Color roxo = new Color(145, 130, 213);

        // 2. NÚMERO DA ARTE
        g.setColor(new Color(180, 180, 180));
        g.setFont(ultra.deriveFont(70f));
        g.drawString(String.format("%02d", num), 60, 120);

        // 3. CÓDIGO DO PRODUTO
        g.setColor(roxo);
        g.setFont(ultra.deriveFont(90f));
        centralizar(g, cod, w, 280);

        // 4. IMAGEM DO PRODUTO
        try {
            BufferedImage prod = ImageIO.read(imgPng);
            if (prod != null) {
                int pW = 900;
                int pH = (prod.getHeight() * pW) / prod.getWidth();
                int yImg = 400 + (1000 - pH) / 2;
                g.drawImage(prod, (w - pW) / 2, yImg, pW, pH, null);
            }
        } catch (Exception e) {}

        // 5. PREÇO "DE" (Com risco)
        if (de != null && !de.isEmpty()) {
            g.setColor(new Color(160, 160, 160));
            g.setFont(ultra.deriveFont(55f));
            String textoDe = "DE R$ " + de;
            FontMetrics fm = g.getFontMetrics();
            int larguraDe = fm.stringWidth(textoDe);
            int xDe = (w - larguraDe) / 2;
            int yDe = 1530;
            g.drawString(textoDe, xDe, yDe);

            g.setStroke(new BasicStroke(6));
            g.drawLine(xDe - 10, yDe - 20, xDe + larguraDe + 10, yDe - 20);
        }

        // 6. PREÇO "POR"
        g.setColor(roxo);
        g.setFont(ultra.deriveFont(160f));
        centralizar(g, "R$ " + por, w, 1720);

        // 7. MENSAGEM DE ENGAJAMENTO
        g.setFont(new Font("Arial", Font.BOLD, 38));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, "COMENTE 'EU QUERO' PARA RECEBER O LINK", w, 1860);

        g.dispose();
        return canvas;
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