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

public class ProdutoStreetWear {

    public static void main(String[] args) {
        int port = 8080;

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
            config.staticFiles.add("/public", Location.CLASSPATH);
        }).start(port);

        System.out.println("🚀 SERVIDOR ATIVO NA PORTA: " + port);

        // --- ENDPOINT ÚNICO ---
        app.post("/gerar-imagem", ctx -> {
            try {
                UploadedFile file = ctx.uploadedFile("foto");
                String apiKey = ctx.formParam("api_key");

                String textoTopo = normalizar(ctx.formParam("texto_topo"), "PEÇA O LINK NOS COMENTÁRIOS");
                String codigo = normalizar(ctx.formParam("codigo"), "PRODUTO");
                int numero = parseIntSeguro(ctx.formParam("numero"), 1);
                String precoDe = normalizar(ctx.formParam("preco_de"), "00,00");
                String precoPor = normalizar(ctx.formParam("preco_por"), "00,00");
                String textoVariacao = normalizar(ctx.formParam("texto_variacao"), "COM VARIAÇÃO DE CORES");
                String instagram = normalizar(ctx.formParam("instagram"), "@STILE_");

                File in = File.createTempFile("raw_", ".png");
                Files.copy(file.content(), in.toPath(), StandardCopyOption.REPLACE_EXISTING);
                File nobg = File.createTempFile("nobg_", ".png");

                // Agora chama a remoção real
                removerFundoReal(in, nobg, apiKey);

                BufferedImage arte = desenharStory(nobg, precoDe, precoPor, codigo, numero, instagram, textoTopo, textoVariacao);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(arte, "png", baos);

                // Deleta temporários
                in.delete(); nobg.delete();

                ctx.contentType("image/png").result(baos.toByteArray());
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro: " + e.getMessage());
            }
        });

        // --- ENDPOINT ZIP ---
        app.post("/gerar-arte", ctx -> {
            try {
                List<UploadedFile> fotos = ctx.uploadedFiles("fotos");
                List<String> textosTopo = ctx.formParams("textos_topo");
                List<String> codigos = ctx.formParams("codigos");
                List<String> numeros = ctx.formParams("numeros");
                List<String> precosDe = ctx.formParams("precos_de");
                List<String> precosPor = ctx.formParams("precos_por");
                List<String> textosVariacao = ctx.formParams("textos_variacao");
                List<String> marcas = ctx.formParams("marcas");
                String apiKey = ctx.formParam("api_key");

                ByteArrayOutputStream zipBaos = new ByteArrayOutputStream();
                ZipOutputStream zos = new ZipOutputStream(zipBaos);

                for (int i = 0; i < fotos.size(); i++) {
                    File in = File.createTempFile("zraw_", ".png");
                    Files.copy(fotos.get(i).content(), in.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    File nobg = File.createTempFile("znobg_", ".png");

                    removerFundoReal(in, nobg, apiKey);

                    BufferedImage arte = desenharStory(
                            nobg,
                            safeGet(precosDe, i, "00,00"),
                            safeGet(precosPor, i, "00,00"),
                            safeGet(codigos, i, "PRODUTO"),
                            parseIntSeguro(safeGet(numeros, i, null), i + 1),
                            safeGet(marcas, i, "@STILE_"),
                            safeGet(textosTopo, i, "PEÇA O LINK NOS COMENTÁRIOS"),
                            safeGet(textosVariacao, i, "COM VARIAÇÃO DE CORES")
                    );

                    zos.putNextEntry(new ZipEntry("STORY_" + i + ".png"));
                    ImageIO.write(arte, "png", zos);
                    zos.closeEntry();

                    in.delete(); nobg.delete();
                }
                zos.finish();
                ctx.contentType("application/zip").result(zipBaos.toByteArray());
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Erro ZIP: " + e.getMessage());
            }
        });
    }

    // --- LÓGICA DE REMOÇÃO REAL ---
    private static void removerFundoReal(File fileIn, File fileOut, String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            try { Files.copy(fileIn.toPath(), fileOut.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception e) {}
            return;
        }

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
                Files.copy(fileIn.toPath(), out);
                writer.println();
                writer.println("--" + boundary + "--");
            }

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    Files.copy(is, fileOut.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            } else {
                // Se der erro, usa a imagem original
                Files.copy(fileIn.toPath(), fileOut.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            try { Files.copy(fileIn.toPath(), fileOut.toPath(), StandardCopyOption.REPLACE_EXISTING); } catch (Exception ex) {}
        }
    }

    private static BufferedImage desenharStory(File imgPng, String de, String por, String codigo, int num, String marca, String topo, String variacao) throws IOException {
        int w = 1080, h = 1920;
        BufferedImage story = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = story.createGraphics();

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);

        Font ultra = carregarFonte("/Ultra-Regular.ttf", 100);
        Color roxo = new Color(145, 130, 213);
        Color cinza = new Color(90, 90, 90);

        g.setFont(ultra.deriveFont(26f));
        g.setColor(cinza);
        centralizar(g, topo.toUpperCase(), w, 120);

        g.setFont(ultra.deriveFont(85f));
        g.setColor(roxo);
        centralizar(g, codigo.toUpperCase(), w, 250);

        g.setFont(ultra.deriveFont(110f));
        g.setColor(new Color(80, 80, 80));
        centralizar(g, String.format("%02d", num), w, 390);

        BufferedImage prod = ImageIO.read(imgPng);
        if (prod != null) {
            int maxW = 850, maxH = 850;
            double scale = Math.min((double) maxW / prod.getWidth(), (double) maxH / prod.getHeight());
            int pW = (int) (prod.getWidth() * scale);
            int pH = (int) (prod.getHeight() * scale);
            g.drawImage(prod, (w - pW) / 2, 500 + (maxH - pH) / 2, pW, pH, null);
        }

        g.setFont(ultra.deriveFont(114f));
        g.setColor(new Color(145, 130, 213, 130));
        String txtDe = "R$" + de;
        centralizar(g, txtDe, w, 1480);

        FontMetrics fm = g.getFontMetrics();
        int tw = fm.stringWidth(txtDe);
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(15));
        g.drawLine((w - tw) / 2 - 10, 1435, (w + tw) / 2 + 10, 1435);

        g.setFont(ultra.deriveFont(150f));
        g.setColor(roxo);
        centralizar(g, "R$" + por, w, 1660);

        g.setFont(ultra.deriveFont(32f));
        g.setColor(cinza);
        centralizar(g, variacao.toUpperCase(), w, 1760);
        centralizar(g, marca.startsWith("@") ? marca.toUpperCase() : "@" + marca.toUpperCase(), w, 1870);

        g.dispose();
        return story;
    }

    private static String safeGet(List<String> lista, int index, String padrao) {
        if (lista == null || index >= lista.size()) return padrao;
        return normalizar(lista.get(index), padrao);
    }

    private static String normalizar(String v, String p) { return (v == null || v.isBlank()) ? p : v; }

    private static int parseIntSeguro(String v, int p) {
        try { return Integer.parseInt(v); } catch (Exception e) { return p; }
    }

    private static void centralizar(Graphics2D g, String t, int w, int y) {
        FontMetrics fm = g.getFontMetrics();
        g.drawString(t, (w - fm.stringWidth(t)) / 2, y);
    }

    private static Font carregarFonte(String path, float size) {
        try (InputStream is = ProdutoStreetWear.class.getResourceAsStream(path)) {
            if (is != null) return Font.createFont(Font.TRUETYPE_FONT, is).deriveFont(size);
        } catch (Exception e) { }
        return new Font("Arial", Font.BOLD, (int) size);
    }
}