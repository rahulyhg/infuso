<?

/**
 * Контроллер управления настройками из админки
 **/
class mod_conf_controller extends mod_controller {

	public static function indexTest() {
		return mod_superadmin::check();
	}

	public static function indexTitle() {
		return "Конфигурация";
	}

	public static function indexFailed() {
		admin::fuckoff();
	}

	public static function index() {

		admin::header("Конфигурация");
		$conf = array();

		// Собираем данные из mod.ini
		foreach(mod::all() as $mod)
			if($call = mod::info($mod,"mod","conf")) {

			    if(!is_array($call))
					$call = array($call);

				foreach($call as $callback) {
					$items = mod::call($callback);
					foreach($items as $item)
	                    $conf[$mod][] = $item;
				}

			}

		// Собираем данные через ООП
		foreach(mod::classes("mod_conf") as $class) {
		    $item = new $class;
			$name = $item->name();
			if(!$conf[$name])
			    $conf[$name] = array();
			$conf[$name] = array_merge($conf[$name],$item->conf());
		}

		echo "<form style='padding:40px;' method='post' >";
		tmp::head("<style>.conftable{} .conftable td{vertical-align:middle;}</style>");

		foreach($conf as $name=>$item) {
		    tmp::exec("/mod/conf/section",$name,$item);
		}

		echo "<br/><br/>";
	    echo "<input type='submit' value='Сохранить' />";
	    echo "<input type='hidden' name='cmd' value='mod:conf:controller:save' />";
	    echo "</form>";

	    tmp::script("$(function(){
	        $('.conf-help').click(function(){
	            var id = $(this).attr('infuso:id');
	            $('#help-'+id).toggle(200);
	        })
	    });");

		admin::footer();
	}
	
	public function index_components() {
	
	    $conf = file::get("/mod/conf/components.yml")->data();
	    tmp::exec("/mod/conf/components",array(
	        "conf" => $conf,
		));
	}
	
	public function index_componentsVisual() {
	    tmp::exec("/mod/conf/components-visual");
	}

	public static function postTest() {
		return mod_superadmin::check();
	}

	public static function post_save($p) {
		unset($p["cmd"]);
		mod_conf::clearCache();
		mod::saveXMLConf(mod_conf::path(),$p);
		mod::fire("mod_confSaved");
	}
	
	public static function post_saveComponentsConf($p) {
		file::get("/mod/conf/components.yml")->put($p["conf"]);
	}
	
	/**
	 * Удаляет один параметр из components.yml
	 **/
	public function post_removeItem($p) {

	    $id = $p["id"];

	    $conf = mod_conf::general();
	    $map = function($conf, $keys = array()) use (&$map, $id) {
	    
	        $ret = array();
	        foreach($conf as $key => $val) {
	        
				$keys2 = $keys;
                $keys2[] = $key;
                $bkey = base64_encode(json_encode($keys2));
                
                if($bkey != $id) {
                
		            if(is_array($val)) {
		                $ret[$key] = $map($val,$keys2);
		            } else {
		                $ret[$key] = $val;
		            }
	            } 
	        }
	        
	        return $ret;
	    
	    };
	    
	    $conf = $map($conf);
		$conf = mod::service("yaml")->write($conf);
		file::get("/mod/conf/components.yml")->put($conf);
	    
	}
	
	/**
	 * Изменяет один параметр из components.yml
	 **/
	public function post_changeItem($p) {

		switch($p["type"]) {
		    default:
		    	$newValue = $p["value"];
		    	break;
            case "yaml":
		    	$newValue = mod::service("yaml")->read($p["value"]);
		    	break;
	    }
	    
	    $keys = json_decode(base64_decode($p["id"]),1);
	    
		$keys = array_map(function($str) {
		    return "['".$str."']";
		},$keys);
		$keys = implode($keys);
		
		$conf = mod_conf::general();
		eval("\$conf{$keys} = \$newValue;");

		$conf = mod::service("yaml")->write($conf);
		file::get("/mod/conf/components.yml")->put($conf);

	}
	
}
