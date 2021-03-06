<?

/**
 * Класс гугл перевода
 **/
class google_translate extends reflex {

    /**
     * Возвращает перевод текста
     **/
    public static function translate($original,$source,$target) {

        $original = trim($original);

        // Не переводим пустые строки
        if(!$original)
            return "";

        // Не переводим числа
        if(is_numeric($original)) {
            return $original;
        }

        mod_profiler::beginOperation("google translate","cached",$original);

        $key = $original."-".$source."-".$target;

        // Пытаемся взять перевод из кэша
        if($cached = mod_cache::get($key)) {
            mod_profiler::endOperation();
            return $cached;
        }

           // Пытаемся достать перевод из базы
        $item = google_translate_cache::all()->eq("original",$original)->eq("source",$source)->eq("target",$target)->one();

           // Если ничего не досталось - делаем запрос в гугл
        if(!$item->exists()) {

            mod_profiler::updateOperation("google translate","real",$original);

            if($translation = self::request($original,$source,$target)) {

                $item = reflex::create("google_translate_cache",array(
                    "original" => $original,
                    "translation" => $translation,
                    "source" => $source,
                    "target" => $target,
                ));
                mod_cache::set($key,$item->data("translation"));

            } else {
                $item->data("translation",$original);
            }
        }

        mod_profiler::endOperation();

        return $item->data("translation");
    }

    /**
     * Выполняет запрос к translate api
     **/
    public static function request($str,$source,$target) {

        // Не делаем запрос, если длина переводимого слова один символ
        if(strlen($str)==1) {
            return $str;
        }

        $params = array(
            "key" => mod::conf("google:key"),
            "q" => $str,
            "source" => $source,
            "target" => $target,
        );

        $url = "https://www.googleapis.com/language/translate/v2?".http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $tr = curl_exec($ch);

        if(!$tr) {
            throw new Exception("Google Translate request error: ".curl_error($ch));
        }

        $tr = json_decode($tr,1);

        // Если при переводе возникла ошибка - выкидываем экзепшн
        if($tr["error"]) {
            throw new Exception("Google translate error: ".$tr["error"]["errors"][0]["message"]);
        }

        return $tr["data"]["translations"][0]["translatedText"];
    }

}
